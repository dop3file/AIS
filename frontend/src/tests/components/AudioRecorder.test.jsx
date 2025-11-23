import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AudioRecorder from '../../components/AudioRecorder';

describe('AudioRecorder Component', () => {
    const mockOnClose = vi.fn();
    const mockOnRecordingComplete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders modal when open', () => {
        render(
            <AudioRecorder
                isOpen={true}
                onClose={mockOnClose}
                onRecordingComplete={mockOnRecordingComplete}
            />
        );

        expect(screen.getByText(/Запись аудио/i)).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <AudioRecorder
                isOpen={false}
                onClose={mockOnClose}
                onRecordingComplete={mockOnRecordingComplete}
            />
        );

        expect(screen.queryByText(/Запись аудио/i)).not.toBeInTheDocument();
    });

    it('shows start recording button initially', () => {
        render(
            <AudioRecorder
                isOpen={true}
                onClose={mockOnClose}
                onRecordingComplete={mockOnRecordingComplete}
            />
        );

        expect(screen.getByText(/Начать запись/i)).toBeInTheDocument();
    });

    it('shows stop button when recording', async () => {
        render(
            <AudioRecorder
                isOpen={true}
                onClose={mockOnClose}
                onRecordingComplete={mockOnRecordingComplete}
            />
        );

        const startButton = screen.getByText(/Начать запись/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(/Остановить запись/i)).toBeInTheDocument();
        });
    });

    it('shows recording indicator when recording', async () => {
        render(
            <AudioRecorder
                isOpen={true}
                onClose={mockOnClose}
                onRecordingComplete={mockOnRecordingComplete}
            />
        );

        const startButton = screen.getByText(/Начать запись/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(/Запись идет/i)).toBeInTheDocument();
        });
    });
});
