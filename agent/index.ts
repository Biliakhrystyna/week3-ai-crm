// agent/tools/index.ts
import { listMoviesTool, updateMovieTool, deleteMovieTool } from './tools/movieTools';
import { createBookingTool } from './tools/bookingTools';
import { listScreeningsTool, createScreeningTool } from './tools/screeningTools';
import { createHallTool } from './tools/hallTools';

export const allTools = [
    listMoviesTool,
    updateMovieTool,
    deleteMovieTool,
    createBookingTool,
    listScreeningsTool,
    createScreeningTool,
    createHallTool
];