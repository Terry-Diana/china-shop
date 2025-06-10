import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Initialize Supabase client with anon key for regular operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Supabase client with service role key for admin operations
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('ShopVista API is running');
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
      
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(data);
  } catch (err) {
    console.error(`Error fetching product ${req.params.id}:`, err);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
      
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// User endpoints
app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(data);
  } catch (err) {
    console.error(`Error fetching user ${req.params.id}:`, err);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Orders endpoints
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    console.error(`Error fetching orders for user ${req.params.userId}:`, err);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = req.body;
    const { data, error } = await supabase
      .from('orders')
      .insert(newOrder)
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Error creating order' });
  }
});

// Admin endpoints
app.post('/api/admin/register', async (req, res) => {
  try {
    const { email, password, name, role, currentAdminId } = req.body;
    
    console.log('🔧 Server: Admin registration request received');
    
    // Validate inputs
    if (!email?.trim() || !password || !name?.trim() || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    if (!['admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }
    
    // Verify current admin has permission (super_admin role)
    if (currentAdminId && currentAdminId !== 'default-super-admin') {
      const { data: currentAdmin, error: adminError } = await supabaseAdmin
        .from('admins')
        .select('role')
        .eq('id', currentAdminId)
        .single();
        
      if (adminError || !currentAdmin || currentAdmin.role !== 'super_admin') {
        return res.status(403).json({ error: 'Only super admins can register new admins' });
      }
    }
    
    console.log('👤 Server: Creating auth user for:', email);
    
    // Create auth user using service role key
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { 
        name: name.trim(),
        role: role
      }
    });

    if (authError) {
      console.error('❌ Server: Registration auth error:', authError);
      if (authError.message.includes('User already registered')) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      return res.status(400).json({ error: `Failed to create user account: ${authError.message}` });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user account' });
    }

    console.log('✅ Server: Auth user created, creating admin record');

    // Create admin record
    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({
        id: authData.user.id,
        email: email.trim(),
        name: name.trim(),
        role: role,
      });

    if (adminError) {
      console.error('❌ Server: Admin record creation error:', adminError);
      
      // Try to clean up the auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log('🧹 Server: Cleaned up auth user after admin record failure');
      } catch (cleanupError) {
        console.error('💥 Server: Failed to cleanup auth user:', cleanupError);
      }
      
      return res.status(400).json({ error: `Failed to create admin record: ${adminError.message}` });
    }

    console.log('✅ Server: Admin registration successful');
    
    res.status(201).json({ 
      message: 'Admin registered successfully',
      admin: {
        id: authData.user.id,
        email: email.trim(),
        name: name.trim(),
        role: role
      }
    });
    
  } catch (error) {
    console.error('💥 Server: Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});