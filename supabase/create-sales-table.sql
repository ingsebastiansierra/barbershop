-- =====================================================
-- Create Sales/Revenue Tracking Table for Barbers
-- =====================================================

-- Table: sales
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'other')),
  client_name TEXT,
  notes TEXT,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sale_time TIME NOT NULL DEFAULT CURRENT_TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_barber_id ON public.sales(barber_id);
CREATE INDEX IF NOT EXISTS idx_sales_barbershop_id ON public.sales(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_barber_date ON public.sales(barber_id, sale_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_updated_at();

-- RLS Policies for sales table
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Barbers can view their own sales
CREATE POLICY "Barbers can view own sales"
  ON public.sales
  FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE id = auth.uid()
    )
  );

-- Barbers can insert their own sales
CREATE POLICY "Barbers can insert own sales"
  ON public.sales
  FOR INSERT
  WITH CHECK (
    barber_id IN (
      SELECT id FROM public.barbers WHERE id = auth.uid()
    )
  );

-- Barbers can update their own sales
CREATE POLICY "Barbers can update own sales"
  ON public.sales
  FOR UPDATE
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE id = auth.uid()
    )
  );

-- Barbers can delete their own sales
CREATE POLICY "Barbers can delete own sales"
  ON public.sales
  FOR DELETE
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE id = auth.uid()
    )
  );

-- Admins can view all sales from their barbershop
CREATE POLICY "Admins can view barbershop sales"
  ON public.sales
  FOR SELECT
  USING (
    barbershop_id IN (
      SELECT barbershop_id 
      FROM public.admin_assignments 
      WHERE user_id = auth.uid()
    )
  );

-- Super admins can view all sales
CREATE POLICY "Super admins can view all sales"
  ON public.sales
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Create a view for sales statistics
CREATE OR REPLACE VIEW public.barber_sales_stats AS
SELECT 
  barber_id,
  sale_date,
  COUNT(*) as total_sales,
  SUM(amount) as total_revenue,
  AVG(amount) as average_sale,
  MAX(amount) as highest_sale,
  MIN(amount) as lowest_sale
FROM public.sales
GROUP BY barber_id, sale_date;

-- Grant access to the view
GRANT SELECT ON public.barber_sales_stats TO authenticated;

COMMENT ON TABLE public.sales IS 'Tracks individual sales/services performed by barbers for financial tracking';
COMMENT ON COLUMN public.sales.service_name IS 'Name of the service provided (e.g., Corte, Barba, Combo)';
COMMENT ON COLUMN public.sales.amount IS 'Amount charged for the service';
COMMENT ON COLUMN public.sales.payment_method IS 'Method of payment: cash, card, transfer, or other';
COMMENT ON COLUMN public.sales.client_name IS 'Optional client name for record keeping';
COMMENT ON COLUMN public.sales.notes IS 'Optional notes about the sale';
