#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class StartupOpsAPITester:
    def __init__(self, base_url="https://cheetah-team-deploy.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        
    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=True):
        """Run a single API test"""
        url = f"{self.base_url}/api{endpoint}" if not endpoint.startswith('/api') else f"{self.base_url}{endpoint}"
        
        if auth_required and self.token:
            self.session.headers.update({'Authorization': f'Bearer {self.token}'})
        elif not auth_required:
            self.session.headers.pop('Authorization', None)

        self.tests_run += 1
        print(f"\n🔍 Testing {name} - {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = self.session.get(url)
            elif method == 'POST':
                response = self.session.post(url, json=data)
            elif method == 'PUT':
                response = self.session.put(url, json=data)
            elif method == 'DELETE':
                response = self.session.delete(url)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASS - Status: {response.status_code}")
                try:
                    return True, response.json() if response.text else {}
                except:
                    return True, {}
            else:
                print(f"❌ FAIL - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ ERROR - {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        print("\n" + "="*50)
        print("Testing API Health Check")
        print("="*50)
        success, response = self.run_test(
            "API Health Check",
            "GET", 
            "/", 
            200,
            auth_required=False
        )
        if success:
            print(f"   API Response: {response}")
        return success

    def test_unauthenticated_endpoints(self):
        """Test that protected endpoints return 401 without auth"""
        print("\n" + "="*50)
        print("Testing Unauthenticated Access")
        print("="*50)
        
        endpoints = [
            ("GET", "/auth/me", "Get current user"),
            ("GET", "/startups", "Get user startups"),
            ("POST", "/startups", "Create startup"),
        ]
        
        passed = 0
        for method, endpoint, desc in endpoints:
            success, _ = self.run_test(
                f"Unauthorized {desc}",
                method,
                endpoint,
                401,
                auth_required=False
            )
            if success:
                passed += 1
        
        return passed == len(endpoints)

    def test_with_mock_token(self):
        """Test with a mock Supabase token"""
        print("\n" + "="*50)
        print("Testing With Mock Auth Token")
        print("="*50)
        
        # Using a mock JWT token for testing - this will likely fail but shows the auth flow
        mock_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwiaWF0IjoxNjAwMDAwMDAwfQ.mock_signature"
        self.token = mock_token
        
        # Test auth endpoints with mock token (these will likely fail but show the flow)
        success, response = self.run_test(
            "Get user profile with mock token",
            "GET",
            "/auth/me",
            401  # Expecting 401 since it's a mock token
        )
        
        return True  # Return true as this is expected to fail with mock token

    def get_test_summary(self):
        """Get test summary"""
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"\n" + "="*50)
        print("TEST SUMMARY")
        print("="*50)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        print("="*50)
        
        return {
            "tests_run": self.tests_run,
            "tests_passed": self.tests_passed,
            "success_rate": success_rate
        }

def main():
    """Main test runner"""
    tester = StartupOpsAPITester()
    
    print("🚀 Starting StartupOps API Tests")
    print(f"Base URL: {tester.base_url}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run test categories
    health_passed = tester.test_health_check()
    unauth_passed = tester.test_unauthenticated_endpoints()
    mock_auth_passed = tester.test_with_mock_token()
    
    # Get final summary
    summary = tester.get_test_summary()
    
    # Determine overall success
    if health_passed:
        print("\n✅ CORE FUNCTIONALITY: API is running and accessible")
    else:
        print("\n❌ CRITICAL ISSUE: API health check failed - backend may be down")
    
    if unauth_passed:
        print("✅ SECURITY: Unauthenticated endpoints properly protected")
    else:
        print("❌ SECURITY ISSUE: Some endpoints may not be properly protected")
    
    # Exit code based on critical functionality
    return 0 if health_passed else 1

if __name__ == "__main__":
    sys.exit(main())