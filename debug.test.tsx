import { render, screen, act } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { InteractivePageExercises } from '../../src/components/cartilla/InteractivePageExercises';
import { ActivityEventsProvider, useActivityEvents } from '../../src/lib/activity-events';
import { MemoryRouter } from 'react-router-dom'; // or whatever router
import { loadLassoProgress } from '../../src/lib/activity-canvas-store';
// I will just modify the existing test file directly and revert it.
