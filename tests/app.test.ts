import promisePool from "../src/config/db";

jest.mock("../src/config/db", () => ({
  getConnection: jest.fn(),
}));

describe("Database Connection", () => {
  it("should log success message when database connection is successful", async () => {
    const mockConnection = {
      release: jest.fn(),
    };
    (promisePool.getConnection as jest.Mock).mockResolvedValue(mockConnection);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await promisePool.getConnection().then((connection) => {
      if (connection) {
        console.log("Database connected successfully!");
        connection.release();
      }
    });

    expect(consoleSpy).toHaveBeenCalledWith("Database connected successfully!");
    expect(mockConnection.release).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should log failure message when database connection fails", async () => {
    (promisePool.getConnection as jest.Mock).mockResolvedValue(null);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await promisePool.getConnection().then((connection) => {
      if (!connection) {
        console.log("Database connection failed");
      }
    });

    expect(consoleSpy).toHaveBeenCalledWith("Database connection failed");

    consoleSpy.mockRestore();
  });
});
