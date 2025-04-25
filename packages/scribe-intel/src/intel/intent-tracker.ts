import { v4 as uuidv4 } from 'uuid';

// Define the structure for tracking nodes
interface IntentNode {
  id: string; // Unique identifier for this intent instance
  name: string; // The name of the intent
  parentId: string | null; // ID of the parent intent instance, if any
  childrenIds: Set<string>; // IDs of direct active children intent instances
  status: 'active' | 'completed' | 'failed' | 'cancelled'; // Current status
  startTime: number; // Timestamp when started
  completionTime: number | null; // Timestamp when completed/failed/cancelled
}

const CLEANUP_DELAY_MS = 30000; // Keep completed nodes in memory for 30 seconds

class IntentTrackerInternal {
  // All nodes currently being tracked (active or recently completed)
  private nodes: Map<string, IntentNode> = new Map();
  // Store timeout IDs for cleanup scheduling
  private cleanupTimeouts: Map<string, NodeJS.Timeout> = new Map();

  generateId(): string {
    return uuidv4();
  }

  /** Called when an intent's start() method is invoked */
  trackStart(name: string, parentId: string | null): string {
    const id = this.generateId();
    const node: IntentNode = {
      id,
      name,
      parentId,
      childrenIds: new Set(),
      status: 'active',
      startTime: Date.now(),
      completionTime: null,
    };

    this.nodes.set(id, node);

    // Link to parent if exists and is active
    if (parentId) {
      const parentNode = this.nodes.get(parentId);
      if (parentNode && parentNode.status === 'active') {
        parentNode.childrenIds.add(id);
      } else {
        // Parent might have already completed/failed, treat as root conceptually
        console.warn(`Parent intent ${parentId} not found or not active when starting child ${id} (${name}).`);
        node.parentId = null; // Adjust node's parentId if linking failed
      }
    }
    console.log(`Tracker: Started ${name} (ID: ${id}, Parent: ${parentId || 'None'})`);
    return id;
  }

  /** Marks an intent as successfully completed */
  trackEnd(id: string): void {
    const node = this.nodes.get(id);
    if (node && node.status === 'active') {
       console.log(`Tracker: Ending ${node.name} (ID: ${id})`);
      node.status = 'completed';
      node.completionTime = Date.now();
      this.scheduleCleanup(id);
      // Successful end doesn't automatically affect children
    }
  }

  /** Marks an intent as failed and cascades failure to active children */
  trackFail(id: string): void {
    this.terminateIntent(id, 'failed');
  }

  /** Marks an intent as cancelled and cascades cancellation to active children */
  trackCancel(id: string): void {
    this.terminateIntent(id, 'cancelled');
  }

  // --- Helper Methods ---

  private terminateIntent(id: string, status: 'failed' | 'cancelled'): void {
    const node = this.nodes.get(id);
    // Only proceed if the node exists and is currently active
    if (node && node.status === 'active') {
      console.log(`Tracker: Terminating ${node.name} (ID: ${id}) as ${status}`);
      node.status = status;
      node.completionTime = Date.now();
      this.cascadeTermination(node, status); // Cascade to children first
      this.scheduleCleanup(id); // Then schedule cleanup for this node
    }
  }

  private cascadeTermination(node: IntentNode, status: 'failed' | 'cancelled'): void {
    node.childrenIds.forEach((childId) => {
      // Recursively call the public fail/cancel method on the tracker
      // This ensures each child is processed correctly (checks status, cascades further, schedules cleanup)
      if (status === 'failed') {
        this.trackFail(childId);
      } else {
        this.trackCancel(childId);
      }
    });
  }

  private scheduleCleanup(id: string): void {
    // Clear existing timeout if node is somehow marked completed again
    const existingTimeout = this.cleanupTimeouts.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      this.cleanupNode(id);
    }, CLEANUP_DELAY_MS);

    this.cleanupTimeouts.set(id, timeoutId);
  }

  private cleanupNode(id: string): void {
    const node = this.nodes.get(id);
    if (node && node.status !== 'active') { // Ensure we don't cleanup active nodes
        console.log(`Tracker: Cleaning up completed node ${node.name} (ID: ${id})`);
        // Remove from parent's children list
        if (node.parentId) {
            const parentNode = this.nodes.get(node.parentId);
            parentNode?.childrenIds.delete(id); // Delete even if parent is no longer active/tracked
        }
        // Remove node itself and its timeout reference
        this.nodes.delete(id);
        this.cleanupTimeouts.delete(id);
    } else {
         console.warn(`Tracker: Cleanup called for node ${id}, but it was not found or was active.`);
         this.cleanupTimeouts.delete(id); // Still remove timeout reference
    }
  }

   // --- Getters for potential external use (e.g., debugging, beacon) ---

   getNode(id: string): IntentNode | undefined {
     return this.nodes.get(id);
   }

   getActiveNodesData(): Partial<IntentNode>[] {
       const activeData: Partial<IntentNode>[] = [];
       this.nodes.forEach(node => {
           if (node.status === 'active') {
                // Select only data needed for beacon/debugging
                activeData.push({
                   id: node.id,
                   name: node.name,
                   parentId: node.parentId,
                   startTime: node.startTime,
                });
           }
       });
       return activeData;
   }
}

// Export the singleton instance
export const intentTracker = new IntentTrackerInternal();
