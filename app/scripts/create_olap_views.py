from sqlalchemy import text
from app.core.database import engine

def create_views():
    with engine.connect() as connection:
        print("Creating OLAP views...")

        # 1. Daily Trends
        # Aggregates notifications by date.
        print("Creating view: analytics_daily_trends")
        connection.execute(text("""
            CREATE OR REPLACE VIEW analytics_daily_trends AS
            SELECT
                DATE(scheduled_time) as date,
                COUNT(*) as total_count,
                COUNT(*) FILTER (WHERE status = 'sent') as success_count,
                COUNT(*) FILTER (WHERE status = 'failed') as failure_count,
                CASE 
                    WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status = 'sent')::numeric / COUNT(*)) * 100, 2)
                    ELSE 0
                END as success_rate_percentage,
                AVG(COUNT(*)) OVER (ORDER BY DATE(scheduled_time) ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg_7d
            FROM notifications
            GROUP BY DATE(scheduled_time)
            ORDER BY date;
        """))

        # 2. Zone Performance
        # Aggregates by Zone.
        print("Creating view: analytics_zone_performance")
        connection.execute(text("""
            CREATE OR REPLACE VIEW analytics_zone_performance AS
            SELECT
                z.name as zone_name,
                COUNT(n.id) as total_broadcasts,
                COUNT(DISTINCT n.audio_file_id) as unique_audio_files,
                MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM n.scheduled_time)) as peak_hour
            FROM broadcast_zones z
            LEFT JOIN notifications n ON z.id = n.zone_id
            GROUP BY z.name;
        """))

        # 3. Cube: Status x Zone x DayOfWeek
        # Multi-dimensional analysis
        print("Creating view: analytics_cube_status_zone")
        connection.execute(text("""
            CREATE OR REPLACE VIEW analytics_cube_status_zone AS
            SELECT
                z.name as zone_name,
                n.status,
                TO_CHAR(n.scheduled_time, 'Day') as day_of_week,
                COUNT(*) as count
            FROM notifications n
            JOIN broadcast_zones z ON n.zone_id = z.id
            GROUP BY CUBE (z.name, n.status, TO_CHAR(n.scheduled_time, 'Day'))
            ORDER BY z.name, n.status, day_of_week;
        """))

        # 4. Forecast Next 30 Days
        # Using Linear Regression on daily counts to project future
        print("Creating view: analytics_forecast_next_30d")
        connection.execute(text("""
            CREATE OR REPLACE VIEW analytics_forecast_next_30d AS
            WITH daily_counts AS (
                SELECT 
                    DATE(scheduled_time) as date,
                    COUNT(*) as count,
                    EXTRACT(EPOCH FROM DATE(scheduled_time)) as date_epoch
                FROM notifications
                GROUP BY DATE(scheduled_time)
            ),
            regression_stats AS (
                SELECT
                    regr_slope(count, date_epoch) as slope,
                    regr_intercept(count, date_epoch) as intercept
                FROM daily_counts
            ),
            future_dates AS (
                SELECT generate_series(
                    CURRENT_DATE, 
                    CURRENT_DATE + INTERVAL '30 days', 
                    INTERVAL '1 day'
                )::date as future_date
            )
            SELECT
                fd.future_date,
                GREATEST(0, (rs.slope * EXTRACT(EPOCH FROM fd.future_date) + rs.intercept)) as predicted_count
            FROM future_dates fd, regression_stats rs;
        """))

        print("OLAP views created successfully.")
        connection.commit()

if __name__ == "__main__":
    create_views()
