"""
Test suite for StartupOps Auth and Onboarding flows:
- POST /api/auth/signup - User registration with auto-confirm
- POST /api/startups - Create workspace
- POST /api/startups/join - Join workspace with invite code
- POST /api/demo/setup - Demo mode setup
"""
import pytest
import requests
import os
import random
import string

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cheetah-team-deploy.preview.emergentagent.com').rstrip('/')

# Import supabase for login
from supabase import create_client

SUPABASE_URL = "https://wtqomgdpukdyxdmvilrj.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cW9tZ2RwdWtkeXhkbXZpbHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODk2MTIsImV4cCI6MjA4NjA2NTYxMn0.4SjgUnFfMOakiAyWCUdkB9sN08NIESkNLBDaPyzjGvA"


def generate_random_email():
    """Generate a random test email"""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{random_str}@test.com"


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_api_health(self):
        """Test API is running"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "StartupOps API is running"
        print("✓ API health check passed")


class TestAuthSignup:
    """Authentication signup endpoint tests"""
    
    def test_signup_creates_user(self):
        """Test POST /api/auth/signup creates user with auto-confirm"""
        email = generate_random_email()
        password = "TestPass123!"
        
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": email,
            "password": password,
            "full_name": "Test User"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "user_id" in data, "Response should contain user_id"
        assert data["message"] == "Account created"
        print(f"✓ Signup successful for {email}, user_id: {data['user_id']}")
        return email, password, data['user_id']
    
    def test_signup_duplicate_email_fails(self):
        """Test signup with existing email returns 409"""
        # First create a user
        email = generate_random_email()
        password = "TestPass123!"
        
        response1 = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": email,
            "password": password,
            "full_name": "Test User"
        })
        assert response1.status_code == 200
        
        # Try to create same user again
        response2 = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": email,
            "password": password,
            "full_name": "Test User 2"
        })
        assert response2.status_code == 409, f"Expected 409 for duplicate email, got {response2.status_code}"
        print(f"✓ Duplicate email correctly rejected with 409")


class TestSignupAndLogin:
    """Full signup -> login -> workspace creation flow"""
    
    def test_signup_then_login_then_create_workspace(self):
        """Test complete founder flow: signup -> login -> create workspace -> dashboard access"""
        # 1. Signup via backend
        email = generate_random_email()
        password = "TestPass123!"
        
        signup_response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": email,
            "password": password,
            "full_name": "Founder Test"
        })
        assert signup_response.status_code == 200, f"Signup failed: {signup_response.text}"
        user_id = signup_response.json()["user_id"]
        print(f"✓ Step 1: User created - {email}")
        
        # 2. Login via Supabase
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        access_token = auth_response.session.access_token
        assert access_token, "Login failed - no access token"
        print(f"✓ Step 2: Login successful, got access token")
        
        # 3. Get profile (should auto-create)
        headers = {"Authorization": f"Bearer {access_token}"}
        profile_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert profile_response.status_code == 200, f"Profile fetch failed: {profile_response.text}"
        profile = profile_response.json()
        assert profile["email"] == email
        print(f"✓ Step 3: Profile retrieved - {profile['full_name']}")
        
        # 4. Check user has no startups yet
        startups_response = requests.get(f"{BASE_URL}/api/startups", headers=headers)
        assert startups_response.status_code == 200
        startups = startups_response.json()
        assert len(startups) == 0, "New user should have no startups"
        print(f"✓ Step 4: Confirmed no startups for new user (onboarding needed)")
        
        # 5. Create a workspace (Founder path)
        create_response = requests.post(f"{BASE_URL}/api/startups", headers=headers, json={
            "name": "Test Startup Inc",
            "description": "A test startup",
            "industry": "saas",
            "stage": "mvp"
        })
        assert create_response.status_code == 200, f"Startup creation failed: {create_response.text}"
        startup = create_response.json()
        assert startup["name"] == "Test Startup Inc"
        assert startup["founder_id"] == user_id
        assert "invite_code" in startup
        print(f"✓ Step 5: Workspace created - {startup['name']} (invite code: {startup['invite_code']})")
        
        # 6. Verify user now has access to dashboard data
        startups_after = requests.get(f"{BASE_URL}/api/startups", headers=headers)
        assert startups_after.status_code == 200
        assert len(startups_after.json()) == 1
        print(f"✓ Step 6: User now has 1 startup - can access dashboard")
        
        return startup["invite_code"]


class TestJoinWorkspace:
    """Team member join workspace flow tests"""
    
    def test_join_with_valid_invite_code(self):
        """Test joining workspace with valid invite code"""
        # 1. Create founder and workspace
        founder_email = generate_random_email()
        password = "TestPass123!"
        
        # Signup founder
        requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": founder_email,
            "password": password,
            "full_name": "Founder"
        })
        
        # Login founder
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        founder_auth = supabase.auth.sign_in_with_password({"email": founder_email, "password": password})
        founder_token = founder_auth.session.access_token
        founder_headers = {"Authorization": f"Bearer {founder_token}"}
        
        # Create workspace
        create_resp = requests.post(f"{BASE_URL}/api/startups", headers=founder_headers, json={
            "name": "Join Test Startup",
            "description": "For testing join flow",
            "industry": "fintech",
            "stage": "idea"
        })
        assert create_resp.status_code == 200
        invite_code = create_resp.json()["invite_code"]
        startup_id = create_resp.json()["id"]
        print(f"✓ Step 1: Founder created workspace with invite code: {invite_code}")
        
        # 2. Create team member and join
        member_email = generate_random_email()
        requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": member_email,
            "password": password,
            "full_name": "Team Member"
        })
        
        member_auth = supabase.auth.sign_in_with_password({"email": member_email, "password": password})
        member_token = member_auth.session.access_token
        member_headers = {"Authorization": f"Bearer {member_token}"}
        
        # Verify member has no startups
        member_startups = requests.get(f"{BASE_URL}/api/startups", headers=member_headers)
        assert len(member_startups.json()) == 0
        print(f"✓ Step 2: Team member has 0 startups (needs to join)")
        
        # 3. Join with invite code
        join_resp = requests.post(f"{BASE_URL}/api/startups/join", headers=member_headers, json={
            "invite_code": invite_code
        })
        assert join_resp.status_code == 200, f"Join failed: {join_resp.text}"
        joined_startup = join_resp.json()
        assert joined_startup["id"] == startup_id
        print(f"✓ Step 3: Team member joined workspace successfully")
        
        # 4. Verify member now has access
        member_startups_after = requests.get(f"{BASE_URL}/api/startups", headers=member_headers)
        assert len(member_startups_after.json()) == 1
        startup_data = member_startups_after.json()[0]
        assert startup_data["user_role"] == "member"
        print(f"✓ Step 4: Member has access with role: {startup_data['user_role']}")
    
    def test_join_with_invalid_invite_code(self):
        """Test joining with invalid code returns 404"""
        member_email = generate_random_email()
        password = "TestPass123!"
        
        requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": member_email,
            "password": password,
            "full_name": "Test Member"
        })
        
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        auth = supabase.auth.sign_in_with_password({"email": member_email, "password": password})
        headers = {"Authorization": f"Bearer {auth.session.access_token}"}
        
        join_resp = requests.post(f"{BASE_URL}/api/startups/join", headers=headers, json={
            "invite_code": "INVALIDCODE123"
        })
        assert join_resp.status_code == 404, f"Expected 404 for invalid code, got {join_resp.status_code}"
        print(f"✓ Invalid invite code correctly rejected with 404")


class TestDemoMode:
    """Demo mode setup and login tests"""
    
    def test_demo_setup_creates_data(self):
        """Test POST /api/demo/setup creates demo user and data"""
        response = requests.post(f"{BASE_URL}/api/demo/setup")
        assert response.status_code == 200, f"Demo setup failed: {response.text}"
        data = response.json()
        assert data["email"] == "demo@startupops.io"
        assert "message" in data
        print(f"✓ Demo setup successful: {data['message']}")
    
    def test_demo_user_can_login(self):
        """Test demo user can login and access dashboard data"""
        # Setup demo
        requests.post(f"{BASE_URL}/api/demo/setup")
        
        # Login as demo user
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        auth = supabase.auth.sign_in_with_password({
            "email": "demo@startupops.io",
            "password": "DemoUser2026!"
        })
        assert auth.session.access_token, "Demo login failed"
        headers = {"Authorization": f"Bearer {auth.session.access_token}"}
        
        # Check demo user has startups
        startups = requests.get(f"{BASE_URL}/api/startups", headers=headers)
        assert startups.status_code == 200
        startup_list = startups.json()
        assert len(startup_list) > 0, "Demo user should have pre-populated startup"
        
        demo_startup = startup_list[0]
        assert demo_startup["name"] == "NexaFlow AI"
        print(f"✓ Demo user has startup: {demo_startup['name']}")
        
        # Check demo has tasks, milestones, feedback
        startup_id = demo_startup["id"]
        
        tasks = requests.get(f"{BASE_URL}/api/startups/{startup_id}/tasks", headers=headers)
        assert tasks.status_code == 200
        assert len(tasks.json()) > 0, "Demo should have tasks"
        print(f"✓ Demo has {len(tasks.json())} tasks")
        
        milestones = requests.get(f"{BASE_URL}/api/startups/{startup_id}/milestones", headers=headers)
        assert milestones.status_code == 200
        assert len(milestones.json()) > 0, "Demo should have milestones"
        print(f"✓ Demo has {len(milestones.json())} milestones")
        
        feedback = requests.get(f"{BASE_URL}/api/startups/{startup_id}/feedback", headers=headers)
        assert feedback.status_code == 200
        assert len(feedback.json()) > 0, "Demo should have feedback"
        print(f"✓ Demo has {len(feedback.json())} feedback items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
