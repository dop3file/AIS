from sqlalchemy import text
from app.core.database import engine

def verify_views():
    with engine.connect() as connection:
        print("Verifying OLAP views...")

        views = [
            "analytics_daily_trends",
            "analytics_zone_performance",
            "analytics_cube_status_zone",
            "analytics_forecast_next_30d"
        ]

        for view in views:
            print(f"\n--- {view} ---")
            try:
                result = connection.execute(text(f"SELECT * FROM {view} LIMIT 5"))
                rows = result.fetchall()
                if rows:
                    for row in rows:
                        print(row)
                else:
                    print("No data found.")
            except Exception as e:
                print(f"Error querying {view}: {e}")

if __name__ == "__main__":
    verify_views()
