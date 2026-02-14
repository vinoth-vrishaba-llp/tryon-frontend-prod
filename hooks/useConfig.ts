
import { useReducer, useCallback, useEffect } from 'react';
import {
    ConfigState, Preset,
    BACKGROUND_OPTIONS, POSE_OPTIONS, EXPRESSION_OPTIONS,
    VIEW_OPTIONS, TIME_OPTIONS, ASPECT_RATIO_OPTIONS,
    CAMERA_OPTIONS, IMAGE_QUALITY_OPTIONS,
    HAIR_STYLE_OPTIONS_WOMEN, FIT_TYPE_OPTIONS, BODY_TYPE_OPTIONS_WOMEN
} from '../types';

const DEFAULT_CONFIG: ConfigState = {
    background: BACKGROUND_OPTIONS[0],
    pose: POSE_OPTIONS[0],
    expression: EXPRESSION_OPTIONS[0],
    view: VIEW_OPTIONS[0],
    time: TIME_OPTIONS[1],
    aspectRatio: ASPECT_RATIO_OPTIONS[0],
    camera: CAMERA_OPTIONS[0],
    quality: IMAGE_QUALITY_OPTIONS[0],
    hairStyle: HAIR_STYLE_OPTIONS_WOMEN[0],
    fitType: FIT_TYPE_OPTIONS[1], // Default to 'Regular'
    bodyType: BODY_TYPE_OPTIONS_WOMEN[0], // Default to 'Slim'
    previewOptions: {
        showOutfitDetails: true,
        highlightFabricTexture: true
    }
};

type Action = 
    | { type: 'UPDATE'; payload: Partial<ConfigState> }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'RESET' }
    | { type: 'LOAD_PRESET'; payload: ConfigState };

interface State {
    history: ConfigState[];
    currentIndex: number;
}

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'UPDATE': {
            const newConfig = { ...state.history[state.currentIndex], ...action.payload };
            const newHistory = state.history.slice(0, state.currentIndex + 1);
            newHistory.push(newConfig);
            if (newHistory.length > 50) {
                newHistory.shift();
            }
            return { history: newHistory, currentIndex: newHistory.length - 1 };
        }
        case 'UNDO':
            return { ...state, currentIndex: Math.max(0, state.currentIndex - 1) };
        case 'REDO':
            return { ...state, currentIndex: Math.min(state.history.length - 1, state.currentIndex + 1) };
        case 'RESET':
            return { history: [DEFAULT_CONFIG], currentIndex: 0 };
        case 'LOAD_PRESET': {
            const newHistory = [...state.history, action.payload];
            return { history: newHistory, currentIndex: newHistory.length - 1 };
        }
        default:
            return state;
    }
};

const PRESETS_KEY = 'vtryon_presets_v2';

// Fix: Updated reducer to handle deletion, renaming, and clearing of presets to fulfill destructuring requirements
const presetsReducer = (p: Preset[], a: any) => {
    switch (a.type) {
        case 'SET': return a.payload;
        case 'ADD': return [...p, a.payload];
        case 'DEL': return p.filter(x => x.id !== a.payload);
        case 'RENAME': return p.map(x => x.id === a.payload.id ? { ...x, name: a.payload.name } : x);
        case 'CLEAR': return [];
        default: return p;
    }
};

export const useConfig = () => {
    const [state, dispatch] = useReducer(reducer, { history: [DEFAULT_CONFIG], currentIndex: 0 });
    const [presets, setPresets] = useReducer(presetsReducer, []);

    const config = state.history[state.currentIndex];

    // Fix: Corrected initial load to target setPresets and added error handling
    useEffect(() => {
        const saved = localStorage.getItem(PRESETS_KEY);
        if (saved) {
            try {
                setPresets({ type: 'SET', payload: JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse saved presets:", e);
            }
        }
    }, []);

    // Fix: Added persistence effect to sync presets to localStorage automatically
    useEffect(() => {
        if (presets.length > 0 || localStorage.getItem(PRESETS_KEY)) {
            localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
        }
    }, [presets]);

    const updateConfig = useCallback((updates: Partial<ConfigState>) => dispatch({ type: 'UPDATE', payload: updates }), []);
    const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
    const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
    
    // Fix: Added the missing savePreset, deletePreset, renamePreset, and clearAllPresets functions
    const savePreset = useCallback((name: string) => {
        const p = { id: Date.now().toString(), name, config };
        setPresets({ type: 'ADD', payload: p });
    }, [config]);

    const deletePreset = useCallback((id: string) => {
        setPresets({ type: 'DEL', payload: id });
    }, []);

    const renamePreset = useCallback((id: string, newName: string) => {
        setPresets({ type: 'RENAME', payload: { id, name: newName } });
    }, []);

    const clearAllPresets = useCallback(() => {
        setPresets({ type: 'CLEAR' });
    }, []);

    const loadPreset = useCallback((id: string) => {
        const p = presets.find(x => x.id === id);
        if (p) {
            dispatch({ type: 'LOAD_PRESET', payload: p.config });
        }
    }, [presets]);

    return {
        config, updateConfig, undo, redo,
        canUndo: state.currentIndex > 0,
        canRedo: state.currentIndex < state.history.length - 1,
        presets, savePreset, loadPreset,
        deletePreset, renamePreset, clearAllPresets
    };
};
