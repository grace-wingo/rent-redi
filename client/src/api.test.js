import axios from "axios";
import { createUser, fetchUsers, fetchUserById, updateUser, deleteUser } from "./api"; // Adjust path as necessary

jest.mock("axios");

describe("API Functions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("createUser should call axios.post and return data", async () => {
        const mockUser = { id: 1, name: "John Doe", zip: "12345" };

        axios.post.mockResolvedValueOnce({ data: mockUser });

        const result = await createUser("John Doe", "12345");

        expect(axios.post).toHaveBeenCalledWith("/users", { name: "John Doe", zip: "12345" });
        expect(result).toEqual(mockUser);
    });

    test("fetchUsers should call axios.get and return data", async () => {
        const mockUsers = [
            { id: 1, name: "John Doe", zip: "12345" },
            { id: 2, name: "Jane Smith", zip: "67890" },
        ];

        axios.get.mockResolvedValueOnce({ data: mockUsers });

        const result = await fetchUsers();

        expect(axios.get).toHaveBeenCalledWith("/users");
        expect(result).toEqual(mockUsers);
    });

    test.only("fetchUserById should call axios.get with the correct ID and return data", async () => {
        const mockUser = { id: 1, name: "John Doe", zip: "12345" };

        axios.get.mockResolvedValueOnce({ data: mockUser });

        const result = await fetchUserById(1);

        expect(axios.get).toHaveBeenCalledWith("/users/1");
        expect(result).toEqual(mockUser);
    });

    test("updateUser should call axios.put with the correct ID and data", async () => {
        const mockUser = { id: 1, name: "John Doe", zip: "12345" };

        axios.put.mockResolvedValueOnce({ data: mockUser });

        const result = await updateUser(1, "John Doe", "12345");

        expect(axios.put).toHaveBeenCalledWith("/users/1", { name: "John Doe", zip: "12345" });
        expect(result).toEqual(mockUser);
    });

    test.only("deleteUser should call axios.delete with the correct ID", async () => {
        const mockResponse = { message: "User deleted successfully" };

        axios.delete.mockResolvedValueOnce({ data: mockResponse });

        const result = await deleteUser(1);

        expect(axios.delete).toHaveBeenCalledWith("/users/1");
        expect(result).toEqual(mockResponse);
    });

    test("deleteUser should throw an error if deletion fails", async () => {
        axios.delete.mockRejectedValueOnce(new Error("Failed to delete user"));

        let error;

        try {
            await deleteUser(1);
        } catch (e) {
            error = e;
        }

        // Assert the error outside the try-catch block
        expect(error).toBeDefined();
        expect(error.message).toBe("Failed to delete user");
    });
});
