// Debug script to add BLOG_EDITOR role
// Run this in browser console at http://localhost:3001

async function addBlogEditorRole() {
  try {
    // Get current user session first
    const sessionResponse = await fetch('/api/auth/session');
    const session = await sessionResponse.json();
    
    if (!session.user) {
      console.error('❌ No user session found');
      return;
    }
    
    console.log('👤 Current user:', session.user);
    console.log('🔐 Current roles:', session.user.roles);
    
    // Add BLOG_EDITOR role
    const response = await fetch('/api/admin/assign-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: session.user.id,
        role: 'BLOG_EDITOR',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Successfully assigned BLOG_EDITOR role!');
      console.log('🔄 Reloading page...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run the function
addBlogEditorRole();