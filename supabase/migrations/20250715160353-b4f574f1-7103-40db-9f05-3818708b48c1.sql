
-- Criar tabela user_favorites (Lista de Desejos)
CREATE TABLE user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Índices para performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_product_id ON user_favorites(product_id);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at);

-- Criar tabela user_savings (Histórico de Economia)
CREATE TABLE user_savings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    original_price DECIMAL(10,2) NOT NULL,
    paid_price DECIMAL(10,2) NOT NULL,
    savings_amount DECIMAL(10,2) NOT NULL,
    savings_type VARCHAR(20) NOT NULL CHECK (savings_type IN ('promotion', 'uti_pro', 'both')),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_user_savings_user_id ON user_savings(user_id);
CREATE INDEX idx_user_savings_purchase_date ON user_savings(purchase_date);
CREATE INDEX idx_user_savings_savings_type ON user_savings(savings_type);

-- Função para calcular economia total
CREATE OR REPLACE FUNCTION get_user_total_savings(p_user_id UUID)
RETURNS TABLE (
    total_savings DECIMAL(10,2),
    promotion_savings DECIMAL(10,2),
    uti_pro_savings DECIMAL(10,2),
    total_purchases INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(savings_amount), 0) as total_savings,
        COALESCE(SUM(CASE WHEN savings_type IN ('promotion', 'both') THEN savings_amount ELSE 0 END), 0) as promotion_savings,
        COALESCE(SUM(CASE WHEN savings_type IN ('uti_pro', 'both') THEN savings_amount ELSE 0 END), 0) as uti_pro_savings,
        COUNT(*)::INTEGER as total_purchases
    FROM user_savings 
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Políticas RLS para user_favorites
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para user_savings
ALTER TABLE user_savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own savings" ON user_savings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all savings" ON user_savings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política especial para inserção de savings (apenas sistema/admin)
CREATE POLICY "System can insert savings" ON user_savings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
