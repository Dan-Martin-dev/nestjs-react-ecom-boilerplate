#!/bin/bash
# Script to test alerting system
# This script will simulate a high CPU load to trigger alerts

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing alerting system by simulating high CPU load...${NC}"
echo -e "${YELLOW}This will run for 60 seconds to trigger alerts${NC}"
echo -e "${YELLOW}Press Ctrl+C to cancel${NC}"

# Function to check if we're running in Docker
in_docker() {
  [ -f /.dockerenv ] && return 0 || return 1
}

# Function to simulate high CPU load
simulate_high_cpu() {
  echo -e "${YELLOW}Starting CPU stress test...${NC}"
  
  # Use stress-ng if available, otherwise fallback to yes command
  if command -v stress-ng &> /dev/null; then
    stress-ng --cpu 2 --timeout 60s
  else
    # Fallback to yes command in multiple processes
    for i in {1..4}; do
      yes > /dev/null &
    done
    sleep 60
    # Cleanup
    pkill -9 yes
  fi
  
  echo -e "${GREEN}CPU stress test completed${NC}"
}

# Function to simulate low disk space
simulate_low_disk() {
  echo -e "${YELLOW}Simulating low disk space...${NC}"
  
  if in_docker; then
    echo -e "${RED}Cannot safely simulate low disk space in Docker container${NC}"
    return
  fi
  
  # Create a 1GB file in /tmp
  dd if=/dev/zero of=/tmp/large_test_file bs=1M count=1024
  echo -e "${YELLOW}Created 1GB test file in /tmp${NC}"
  echo -e "${YELLOW}Waiting 60 seconds...${NC}"
  sleep 60
  
  # Cleanup
  rm /tmp/large_test_file
  echo -e "${GREEN}Disk space test completed, removed test file${NC}"
}

# Main testing function
run_tests() {
  echo -e "${YELLOW}====================================${NC}"
  echo -e "${YELLOW}Running alert tests - please wait${NC}"
  echo -e "${YELLOW}====================================${NC}"
  
  # CPU load test
  simulate_high_cpu
  
  echo -e "${YELLOW}====================================${NC}"
  echo -e "${GREEN}Tests completed.${NC}"
  echo -e "${YELLOW}Check Alertmanager at http://localhost:9093${NC}"
  echo -e "${YELLOW}Check your email and Slack for notifications${NC}"
  echo -e "${YELLOW}====================================${NC}"
}

# Check if running as root if not in Docker
if ! in_docker && [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root for full test capability${NC}"
  exit 1
fi

# Run the tests
run_tests
