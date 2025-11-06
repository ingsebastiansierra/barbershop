/**
 * BarberSalesScreen
 * Screen for barbers to track their sales and revenue
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import {
  useTodaySales,
  useWeekSales,
  useMonthSales,
  useSalesStats,
  useCreateSale,
  useDeleteSale,
} from '../../hooks/useSales';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { showToast } from '../../utils/toast';
import { salesService, Sale } from '../../services/sales.service';

type Period = 'today' | 'week' | 'month';

export const BarberSalesScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');
  const [addSaleModalVisible, setAddSaleModalVisible] = useState(false);

  // Form state
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'other'>('cash');
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch sales based on period
  const { data: todaySales = [], isLoading: loadingToday, refetch: refetchToday } = useTodaySales(user?.id || '');
  const { data: weekSales = [], isLoading: loadingWeek, refetch: refetchWeek } = useWeekSales(user?.id || '');
  const { data: monthSales = [], isLoading: loadingMonth, refetch: refetchMonth } = useMonthSales(user?.id || '');

  // Get stats for selected period
  const getDateRange = () => {
    const today = new Date();
    if (selectedPeriod === 'today') {
      const date = today.toISOString().split('T')[0];
      return { startDate: date, endDate: date };
    } else if (selectedPeriod === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return {
        startDate: weekStart.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
    } else {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: monthStart.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
    }
  };

  const { startDate, endDate } = getDateRange();
  const { data: stats } = useSalesStats(user?.id || '', startDate, endDate);

  // Mutations
  const createSaleMutation = useCreateSale();
  const deleteSaleMutation = useDeleteSale();

  const currentSales = selectedPeriod === 'today' ? todaySales : selectedPeriod === 'week' ? weekSales : monthSales;
  const isLoading = selectedPeriod === 'today' ? loadingToday : selectedPeriod === 'week' ? loadingWeek : loadingMonth;

  const handleAddSale = async () => {
    try {
      if (!serviceName.trim()) {
        showToast.error('El nombre del servicio es requerido');
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        showToast.error('El monto debe ser mayor a 0');
        return;
      }

      if (!user?.barbershop_id) {
        showToast.error('No se encontró la barbería');
        return;
      }

      showToast.loading('Registrando venta...');

      await createSaleMutation.mutateAsync({
        barberId: user.id,
        barbershopId: user.barbershop_id,
        data: {
          service_name: serviceName.trim(),
          amount: amountNum,
          payment_method: paymentMethod,
          client_name: clientName.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });

      showToast.success('Venta registrada correctamente');
      setAddSaleModalVisible(false);
      resetForm();
      
      // Refetch based on period
      if (selectedPeriod === 'today') refetchToday();
      else if (selectedPeriod === 'week') refetchWeek();
      else refetchMonth();
    } catch (error: any) {
      showToast.error(error.message || 'No se pudo registrar la venta');
    }
  };

  const handleDeleteSale = (sale: Sale) => {
    Alert.alert(
      'Eliminar Venta',
      `¿Estás seguro de eliminar esta venta de ${salesService.formatCurrency(Number(sale.amount))}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              showToast.loading('Eliminando venta...');
              await deleteSaleMutation.mutateAsync(sale.id);
              showToast.success('Venta eliminada');
              
              if (selectedPeriod === 'today') refetchToday();
              else if (selectedPeriod === 'week') refetchWeek();
              else refetchMonth();
            } catch (error: any) {
              showToast.error(error.message || 'No se pudo eliminar la venta');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setServiceName('');
    setAmount('');
    setPaymentMethod('cash');
    setClientName('');
    setNotes('');
  };

  const renderSaleCard = (sale: Sale) => (
    <View key={sale.id} style={[styles.saleCard, { backgroundColor: colors.surface }]}>
      <View style={styles.saleHeader}>
        <View style={styles.saleInfo}>
          <Text style={[styles.serviceName, { color: colors.textPrimary }]}>
            {sale.service_name}
          </Text>
          <Text style={[styles.saleTime, { color: colors.textSecondary }]}>
            {sale.sale_time.substring(0, 5)} • {salesService.getPaymentMethodName(sale.payment_method)}
          </Text>
          {sale.client_name && (
            <Text style={[styles.clientName, { color: colors.textSecondary }]}>
              Cliente: {sale.client_name}
            </Text>
          )}
        </View>
        <View style={styles.saleActions}>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {salesService.formatCurrency(Number(sale.amount))}
          </Text>
          <TouchableOpacity onPress={() => handleDeleteSale(sale)} style={styles.deleteButton}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      {sale.notes && (
        <Text style={[styles.notes, { color: colors.textSecondary }]}>
          {sale.notes}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.statLabel}>Total Ventas</Text>
          <Text style={styles.statValue}>{stats?.total_sales || 0}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.success }]}>
          <Text style={styles.statLabel}>Ingresos</Text>
          <Text style={styles.statValue}>
            {salesService.formatCurrency(stats?.total_revenue || 0)}
          </Text>
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'today' && { backgroundColor: colors.primary },
            selectedPeriod !== 'today' && { backgroundColor: colors.surface },
          ]}
          onPress={() => setSelectedPeriod('today')}
        >
          <Text
            style={[
              styles.periodButtonText,
              { color: selectedPeriod === 'today' ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            Hoy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'week' && { backgroundColor: colors.primary },
            selectedPeriod !== 'week' && { backgroundColor: colors.surface },
          ]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text
            style={[
              styles.periodButtonText,
              { color: selectedPeriod === 'week' ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            Semana
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'month' && { backgroundColor: colors.primary },
            selectedPeriod !== 'month' && { backgroundColor: colors.surface },
          ]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text
            style={[
              styles.periodButtonText,
              { color: selectedPeriod === 'month' ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            Mes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sales List */}
      <ScrollView style={styles.salesList} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : currentSales.length > 0 ? (
          currentSales.map(renderSaleCard)
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>💰</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay ventas registradas
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Sale Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setAddSaleModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Sale Modal */}
      <Modal
        visible={addSaleModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddSaleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Registrar Venta
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Servicio *"
                value={serviceName}
                onChangeText={setServiceName}
                placeholder="Ej: Corte, Barba, Combo"
              />

              <Input
                label="Monto *"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Método de Pago *
              </Text>
              <View style={styles.paymentMethods}>
                {(['cash', 'card', 'transfer', 'other'] as const).map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentMethod,
                      paymentMethod === method && { backgroundColor: colors.primary },
                      paymentMethod !== method && { backgroundColor: colors.background },
                    ]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text
                      style={[
                        styles.paymentMethodText,
                        { color: paymentMethod === method ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {salesService.getPaymentMethodName(method)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Cliente (opcional)"
                value={clientName}
                onChangeText={setClientName}
                placeholder="Nombre del cliente"
              />

              <Input
                label="Notas (opcional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Notas adicionales"
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setAddSaleModalVisible(false);
                  resetForm();
                }}
                variant="outline"
                size="md"
              />
              <Button
                title="Guardar"
                onPress={handleAddSale}
                variant="primary"
                size="md"
                loading={createSaleMutation.isPending}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.9,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  salesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  saleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saleInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  saleTime: {
    fontSize: 12,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 12,
  },
  saleActions: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
  },
  notes: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  paymentMethod: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
});
