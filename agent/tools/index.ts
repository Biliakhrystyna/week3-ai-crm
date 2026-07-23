// agent/tools/index.ts
import { listMoviesTool, updateMovieTool, deleteMovieTool } from './movieTools';
import { createBookingTool } from './bookingTools';
import { listScreeningsTool, createScreeningTool } from './screeningTools';
import { createHallTool } from './hallTools';

export const allTools = [
    listMoviesTool,
    updateMovieTool,
    deleteMovieTool,
    createBookingTool,
    listScreeningsTool,
    createScreeningTool,
    createHallTool
];