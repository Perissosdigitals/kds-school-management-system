/**
 * @jest-environment jsdom
 * 
 * Note: This test suite is written using Jest and React Testing Library.
 * It assumes a testing environment has been set up to handle these tools
 * and mock ES module imports.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// FIX: Import Jest's global functions to resolve TypeScript errors.
import { describe, it, expect, jest, afterEach } from '@jest/globals';

import { TeacherManagement } from './TeacherManagement';
import * as TeacherService from '../services/api/teachers.service';
import type { Teacher } from '../types';

// Mock the service module to control its behavior in tests
jest.mock('../services/api/teachers.service');

// Cast the mocked module to control the mock implementation
const mockedGetTeachers = TeacherService.getTeachers as jest.Mock;

const mockTeachers: Teacher[] = [
  { id: 'T01', lastName: 'Dupont', firstName: 'Jean', subject: 'Maths', phone: '123456789', email: 'j.d@test.com', status: 'Actif' },
  { id: 'T02', lastName: 'Martin', firstName: 'Marie', subject: 'Français', phone: '987654321', email: 'm.m@test.com', status: 'Inactif' },
];

describe('TeacherManagement Component', () => {

  // Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display a loading spinner while fetching data', () => {
    // Mock a promise that never resolves to keep the component in a loading state
    mockedGetTeachers.mockReturnValue(new Promise(() => {}));
    
    render(<TeacherManagement />);

    // The loading text should be visible
    expect(screen.getByText(/Chargement.../i)).toBeInTheDocument();
  });

  it('should render the component title and action buttons', async () => {
    // Mock the service to return an empty array to quickly get past the loading state
    mockedGetTeachers.mockResolvedValue([]);
    render(<TeacherManagement />);
    
    // Wait for any async operations to complete
    await waitFor(() => {
      // The main title of the page should be present
      expect(screen.getByText(/Gestion des Professeurs/i)).toBeInTheDocument();
    });

    // All primary action buttons should be rendered
    expect(screen.getByRole('button', { name: /Importer CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Télécharger Modèle/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exporter CSV/i })).toBeInTheDocument();
  });

  it('should display teachers data in a table after successful fetch', async () => {
    mockedGetTeachers.mockResolvedValue(mockTeachers);

    render(<TeacherManagement />);

    // Wait for the loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Chargement.../i)).not.toBeInTheDocument();
    });

    // Check for table headers
    expect(screen.getByRole('columnheader', { name: /ID Professeur/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Nom Complet/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Matière/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Statut/i })).toBeInTheDocument();

    // Check for specific teacher data in the table
    expect(screen.getByText(/Dupont Jean/i)).toBeInTheDocument();
    expect(screen.getByText(/Maths/i)).toBeInTheDocument();
    expect(screen.getByText(/Actif/i)).toBeInTheDocument();

    expect(screen.getByText(/Martin Marie/i)).toBeInTheDocument();
    expect(screen.getByText(/Français/i)).toBeInTheDocument();
    expect(screen.getByText(/Inactif/i)).toBeInTheDocument();

    // The table should have 3 rows: 1 header row + 2 data rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
  });

  it('should handle API errors gracefully without crashing', async () => {
     // Suppress console.error for this test as we are intentionally causing an error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockedGetTeachers.mockRejectedValue(new Error('API Error'));

    // The component should render without crashing
    render(<TeacherManagement />);

    // It should stop loading
    await waitFor(() => {
      expect(screen.queryByText(/Chargement.../i)).not.toBeInTheDocument();
    });

    // The table should be empty (only the header row)
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1);

    // Restore the original console.error function
    consoleErrorSpy.mockRestore();
  });
});
