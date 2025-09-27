#!/usr/bin/env python3
"""
Backend API Test Suite for Pocket Mentor+ Project
Tests the FastAPI backend endpoints and functionality
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class BackendAPITester:
    def __init__(self, base_url="https://faster-zip.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            'name': name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })

    def test_api_root(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{self.api_base}/", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_message = "Hello World"
                if data.get('message') == expected_message:
                    self.log_test("API Root Endpoint", True, f"Response: {data}")
                else:
                    self.log_test("API Root Endpoint", False, f"Unexpected message: {data}")
            else:
                self.log_test("API Root Endpoint", False, f"Status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("API Root Endpoint", False, f"Connection error: {str(e)}")
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Error: {str(e)}")

    def test_create_status_check(self):
        """Test creating a status check"""
        try:
            test_data = {
                "client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"
            }
            
            response = requests.post(
                f"{self.api_base}/status", 
                json=test_data,
                timeout=10
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ['id', 'client_name', 'timestamp']
                
                if all(field in data for field in required_fields):
                    self.log_test("Create Status Check", True, f"Created: {data['id']}")
                    return data['id']  # Return ID for further testing
                else:
                    self.log_test("Create Status Check", False, f"Missing fields in response: {data}")
            else:
                self.log_test("Create Status Check", False, f"Status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Create Status Check", False, f"Connection error: {str(e)}")
        except Exception as e:
            self.log_test("Create Status Check", False, f"Error: {str(e)}")
        
        return None

    def test_get_status_checks(self):
        """Test retrieving status checks"""
        try:
            response = requests.get(f"{self.api_base}/status", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Status Checks", True, f"Retrieved {len(data)} status checks")
                else:
                    self.log_test("Get Status Checks", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("Get Status Checks", False, f"Status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get Status Checks", False, f"Connection error: {str(e)}")
        except Exception as e:
            self.log_test("Get Status Checks", False, f"Error: {str(e)}")

    def test_cors_headers(self):
        """Test CORS headers are present"""
        try:
            response = requests.options(f"{self.api_base}/", timeout=10)
            headers = response.headers
            
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            present_headers = [h for h in cors_headers if h in headers]
            
            if len(present_headers) >= 1:  # At least some CORS headers present
                self.log_test("CORS Headers", True, f"Present: {present_headers}")
            else:
                self.log_test("CORS Headers", False, f"No CORS headers found")
                
        except requests.exceptions.RequestException as e:
            self.log_test("CORS Headers", False, f"Connection error: {str(e)}")
        except Exception as e:
            self.log_test("CORS Headers", False, f"Error: {str(e)}")

    def test_invalid_endpoint(self):
        """Test handling of invalid endpoints"""
        try:
            response = requests.get(f"{self.api_base}/nonexistent", timeout=10)
            success = response.status_code == 404
            
            if success:
                self.log_test("Invalid Endpoint Handling", True, "Returns 404 as expected")
            else:
                self.log_test("Invalid Endpoint Handling", False, f"Status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Invalid Endpoint Handling", False, f"Connection error: {str(e)}")
        except Exception as e:
            self.log_test("Invalid Endpoint Handling", False, f"Error: {str(e)}")

    def test_api_performance(self):
        """Test API response time"""
        try:
            start_time = datetime.now()
            response = requests.get(f"{self.api_base}/", timeout=10)
            end_time = datetime.now()
            
            response_time = (end_time - start_time).total_seconds()
            
            if response.status_code == 200 and response_time < 5.0:
                self.log_test("API Performance", True, f"Response time: {response_time:.2f}s")
            else:
                self.log_test("API Performance", False, f"Slow response: {response_time:.2f}s")
                
        except requests.exceptions.RequestException as e:
            self.log_test("API Performance", False, f"Connection error: {str(e)}")
        except Exception as e:
            self.log_test("API Performance", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests...")
        print(f"📍 Testing API at: {self.api_base}")
        print("=" * 50)
        
        # Test basic connectivity
        self.test_api_root()
        
        # Test CRUD operations
        status_id = self.test_create_status_check()
        self.test_get_status_checks()
        
        # Test error handling
        self.test_invalid_endpoint()
        
        # Test CORS
        self.test_cors_headers()
        
        # Test performance
        self.test_api_performance()
        
        # Print summary
        print("=" * 50)
        print(f"📊 Test Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Detailed results
        print("\n📋 Detailed Results:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"   {status} {result['name']}")
            if result['details'] and not result['success']:
                print(f"      └─ {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    print("🎓 Pocket Mentor+ Backend API Test Suite")
    print("=" * 50)
    
    tester = BackendAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend is working correctly.")
        return 0
    else:
        print(f"\n⚠️  Some tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())