export type Action = 'search' | 'open';

export interface ActionHandler {
    execute(params: string[], options: ActionOptions): Promise<void>;
}

export interface ActionResult {
    success: boolean;
    message: string;
    data?: any;
}

export interface ActionOptions {
    keepOpen?: boolean; // Optional, will use action's default if not specified
}

export interface ActionConfig {
    defaultKeepOpen: boolean;
    description: string;
} 