import time

def main():
    print("Starting the test script...")
    for i in range(5):
        print(f"Processing {i}...")
        time.sleep(1)
    print("Test script completed.")

if __name__ == "__main__":
    main()