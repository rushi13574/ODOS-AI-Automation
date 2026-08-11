import { Injectable } from '@nestjs/common';

export interface TaskInput {
  skillNodeId: string;
  estimatedMinutes: number;
  prerequisites: string[]; // array of skillNodeIds this task depends on
}

@Injectable()
export class DependencyResolver {
  /**
   * Sorts tasks topologically so that prerequisites always appear before dependent tasks.
   * Throws an error if a circular dependency is detected.
   */
  topologicalSort(tasks: TaskInput[]): TaskInput[] {
    const taskMap = new Map<string, TaskInput>();
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    tasks.forEach(t => {
      taskMap.set(t.skillNodeId, t);
      adjacencyList.set(t.skillNodeId, []);
      inDegree.set(t.skillNodeId, 0);
    });

    tasks.forEach(t => {
      t.prerequisites.forEach(prereqId => {
        // If the prerequisite is in our task list, build the graph
        if (taskMap.has(prereqId)) {
          adjacencyList.get(prereqId)!.push(t.skillNodeId);
          inDegree.set(t.skillNodeId, inDegree.get(t.skillNodeId)! + 1);
        }
      });
    });

    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    const sortedTasks: TaskInput[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      sortedTasks.push(taskMap.get(currentId)!);

      adjacencyList.get(currentId)!.forEach(neighborId => {
        const newDegree = inDegree.get(neighborId)! - 1;
        inDegree.set(neighborId, newDegree);
        if (newDegree === 0) {
          queue.push(neighborId);
        }
      });
    }

    if (sortedTasks.length !== tasks.length) {
      throw new Error('Circular dependency detected in tasks');
    }

    return sortedTasks;
  }
}
