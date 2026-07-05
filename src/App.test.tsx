import { render, screen } from '@testing-library/react';
import App from './App';
import {expect, test} from "vitest";

test('renders employees', async () => {
    render(<App />);
    const linkElement = await screen.findAllByText("Employees");
    expect(linkElement.length).toEqual(2);
});