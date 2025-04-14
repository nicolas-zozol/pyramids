export type Action = 'search' | 'open';

export interface ActionHandler {
    execute(params: string[]): Promise<void>;
}

export interface ActionResult {
    success: boolean;
    message: string;
    data?: any;
} 