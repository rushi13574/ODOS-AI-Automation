"use client";
import React from 'react';
import { ComparisonRow } from '../../hooks/useCalendar';

interface Props {
  comparison: ComparisonRow[];
}

export function ComparisonTable({ comparison }: Props) {
  if (comparison.length === 0) return <div>No data to compare.</div>;

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baseline Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {comparison.map(row => (
            <tr key={row.taskId} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{row.taskTitle}</div>
                <div className="text-sm text-gray-500">{row.module}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.baselineDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                {row.currentDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {row.differenceDays === 0 ? (
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">On Track</span>
                ) : row.differenceDays > 0 ? (
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded">+{row.differenceDays} days</span>
                ) : (
                  <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">{row.differenceDays} days</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

