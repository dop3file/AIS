import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';


afterEach(() => {
    cleanup();
});


Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => { },
    }),
});


global.MediaRecorder = class MediaRecorder {
    constructor() {
        this.state = 'inactive';
        this.ondataavailable = null;
        this.onstop = null;
    }
    start() {
        this.state = 'recording';
    }
    stop() {
        this.state = 'inactive';
        if (this.onstop) this.onstop();
    }
};


Object.defineProperty(navigator, 'mediaDevices', {
    value: {
        getUserMedia: () => Promise.resolve({
            getTracks: () => [{
                stop: () => { }
            }]
        })
    }
});
