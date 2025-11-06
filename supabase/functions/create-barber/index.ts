// Edge Function to create a barber user
// This function uses the service role key to create users without email confirmation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Create regular client to verify the calling user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verify the calling user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Verify the user is an admin
    const { data: userData, error: userDataError } = await supabaseClient
      .from('users')
      .select('role, barbershop_id')
      .eq('id', user.id)
      .single()

    if (userDataError || !userData || userData.role !== 'admin') {
      throw new Error('Only admins can create barbers')
    }

    // Get request body
    const { email, password, full_name, phone, specialties, bio, schedule } = await req.json()

    // Validate required fields
    if (!email || !password || !full_name) {
      throw new Error('Missing required fields: email, password, full_name')
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    // Create the barber user with admin API (no email confirmation required)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        phone: phone || null,
      },
    })

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`)
    }

    if (!newUser.user) {
      throw new Error('User creation failed')
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin.from('users').insert({
      id: newUser.user.id,
      email,
      full_name,
      phone: phone || null,
      role: 'barber',
      barbershop_id: userData.barbershop_id,
    })

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw new Error(`Failed to create user profile: ${profileError.message}`)
    }

    // Create barber profile
    const { error: barberError } = await supabaseAdmin.from('barbers').insert({
      user_id: newUser.user.id,
      barbershop_id: userData.barbershop_id,
      specialties: specialties || [],
      bio: bio || null,
      schedule: schedule || {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
      },
      is_active: true,
    })

    if (barberError) {
      // If barber creation fails, delete the user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      await supabaseAdmin.from('users').delete().eq('id', newUser.user.id)
      throw new Error(`Failed to create barber profile: ${barberError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user.id,
        email: newUser.user.email,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
