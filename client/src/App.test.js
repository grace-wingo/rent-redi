// App.test.js
import { render, screen } from "@testing-library/react";
import App from "./App";
import * as api from "./api";
import React from "react";

// Mock the API functions
jest.mock("./api"); 

describe("App Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders the user list", async () => {
      api.fetchUsers.mockResolvedValueOnce([
          { id: 1, name: "John Doe", zip: "12345" },
          { id: 2, name: "Jane Smith", zip: "67890" },
      ]);
  
      render(<App />);
  
   const johnDoe = await screen.findByText(/John Doe/i);
   const janeSmith = await screen.findByText(/Jane Smith/i);

   expect(johnDoe).toBeInTheDocument();
   expect(janeSmith).toBeInTheDocument();
  });
});
