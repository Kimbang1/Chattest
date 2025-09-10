# Chat Application Project

This project consists of a Spring Boot (Java) backend and a React Native (TypeScript) frontend, designed to demonstrate a real-time chat application.

## Project Structure

- `Backend/`: Contains the Spring Boot backend application.
- `Frontend/`: Contains the React Native frontend application.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Java Development Kit (JDK) 17 or higher**: Required for the Spring Boot backend.
- **Node.js (LTS version) and npm**: Required for the React Native frontend. npm is usually installed with Node.js.
- **Android Studio / Xcode (for iOS development)**: Necessary for running the React Native application on emulators/simulators or physical devices.
- **Git**: For cloning the repository.

## Setup and Running the Application

Follow these steps to set up and run both the backend and frontend components of the application.

### 1. Clone the Repository

First, clone this repository to your local machine:

```bash
git clone <repository_url>
cd Chattest
```

### 2. Backend Setup and Run

Navigate to the `Backend` directory and start the Spring Boot application. Gradle will automatically download all necessary dependencies.

```bash
cd Backend
./gradlew bootRun
```

**For Windows users, use `gradlew.bat`:**

```bash
cd Backend
gradlew.bat bootRun
```

Wait for the backend application to start successfully. You should see logs indicating that the server is running (e.g., on port 8080).

### 3. Frontend Setup and Run

Open a **new terminal window**, navigate to the `Frontend` directory, install dependencies, and then run the React Native application.

```bash
cd Frontend
```

**Install Dependencies:**

This command will download all JavaScript dependencies listed in `package.json`.

```bash
npm install
```

**Start the Metro Bundler:**

This command starts the Metro Bundler, which compiles the React Native application. Keep this terminal window open.

```bash
npx react-native start
```

**Run the Application on a Device/Emulator:**

Open **another new terminal window**, navigate to the `Frontend` directory, and run the application on your desired platform.

- **For Android:**

  Ensure you have an Android emulator running or a device connected.
  ```bash
  npx react-native run-android
  ```

- **For iOS (macOS only):**

  Ensure you have an iOS simulator running or a device connected.
  ```bash
  npx react-native run-ios
  ```

### 4. Verify the Application

Once both the backend and frontend are running, the React Native application should display the `ChatListScreen`. Note that the chat room list will be empty as the hardcoded data in the backend has been removed. You can still navigate to a chat room and test the real-time messaging functionality.

---

Feel free to explore the code and make further enhancements!