import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount rendered components after each test so DOM doesn't leak between tests.
afterEach(() => cleanup());
