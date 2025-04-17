import { setupTelemetry, Telemetry } from '@robusta/telemetry';

// Initialize telemetry with proper configuration
setupTelemetry();

// Create a component for our demo app
const COMPONENT_NAME = 'TelemetryDemo';
const telemetry = Telemetry.factory('API', COMPONENT_NAME);

interface DemoAction {
  type: 'success' | 'error' | 'warning';
  label: string;
}

// Demo actions to showcase different telemetry features
const DEMO_ACTIONS: DemoAction[] = [
  { type: 'success', label: 'Simulate Success' },
  { type: 'error', label: 'Simulate Error' },
  { type: 'warning', label: 'Simulate Warning' },
];

// Create UI elements
const app = document.createElement('div');
app.style.padding = '20px';
app.style.fontFamily = 'Arial, sans-serif';

const title = document.createElement('h1');
title.textContent = 'Telemetry Demo';
app.appendChild(title);

const description = document.createElement('p');
description.textContent =
  'Click the buttons below to generate different types of telemetry events:';
app.appendChild(description);

const resultDiv = document.createElement('div');
resultDiv.style.marginTop = '20px';
resultDiv.style.padding = '10px';
resultDiv.style.border = '1px solid #ccc';
resultDiv.style.borderRadius = '4px';
app.appendChild(resultDiv);

// Create action buttons
DEMO_ACTIONS.forEach((action) => {
  const button = document.createElement('button');
  button.textContent = action.label;
  button.style.margin = '5px';
  button.style.padding = '8px 16px';

  button.addEventListener('click', () => handleAction(action));
  app.appendChild(button);
});

document.body.appendChild(app);

// Handle different types of actions
async function handleAction(action: DemoAction): Promise<void> {
  const timestamp = new Date().toISOString();

  try {
    switch (action.type) {
      case 'success': {
        telemetry.log('User triggered success action', {
          timestamp,
          actionType: action.type,
        });
        await simulateAsyncWork();
        updateResult('✅ Success event logged!');
        break;
      }
      case 'error': {
        await simulateErrorScenario();
        break;
      }
      case 'warning': {
        telemetry.warn('User triggered warning action', {
          timestamp,
          actionType: action.type,
          warningCode: 'DEMO_WARNING',
        });
        updateResult('⚠️ Warning event logged!');
        break;
      }
    }
  } catch (error) {
    telemetry.error('Action failed', error as Error);
    updateResult('❌ Error logged! Check console for details.');
  }
}

// Utility functions
function updateResult(message: string): void {
  resultDiv.textContent = `${message} (${new Date().toLocaleTimeString()})`;
}

async function simulateAsyncWork(): Promise<void> {
  telemetry.log('Starting async work');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  telemetry.log('Async work completed');
}

async function simulateErrorScenario(): Promise<never> {
  telemetry.log('About to simulate error');
  throw new Error('Simulated error for demo purposes');
}

// Log application start
telemetry.log('Application initialized', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
});
