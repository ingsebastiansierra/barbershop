/**
 * BarberRequestsScreen
 * Screen for admin to review and approve/reject barber applications
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../store/themeStore';
import { useAdminBarbershop } from '../../hooks/useAdminBarbershop';
import { barberService } from '../../services/barber.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Avatar } from '../../components/common/Avatar';
import { BarberWithUser } from '../../types/models';
import { spacing, typography } from '../../styles/theme';
import { showToast } from '../../utils/toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const BarberRequestsScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const queryClient = useQueryClient();
  const { data: barbershop } = useAdminBarbershop();

  console.log('BarberRequestsScreen - barbershop:', barbershop);

  const [selectedBarber, setSelectedBarber] = useState<BarberWithUser | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending barbers
  const {
    data: pendingBarbers = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['pending-barbers', barbershop?.id],
    queryFn: async () => {
      console.log('Fetching pending barbers for barbershop:', barbershop?.id);
      const result = await barberService.getPendingBarbers(barbershop!.id);
      console.log('Pending barbers result:', result);
      return result;
    },
    enabled: !!barbershop,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (barberId: string) => barberService.approveBarber(barberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-barbers'] });
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      showToast('success', 'Barbero aprobado correctamente');
    },
    onError: (error: any) => {
      showToast('error', error.message || 'Error al aprobar barbero');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ barberId, reason }: { barberId: string; reason: string }) =>
      barberService.rejectBarber(barberId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-barbers'] });
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      setShowRejectModal(false);
      setSelectedBarber(null);
      setRejectionReason('');
      showToast('success', 'Solicitud rechazada');
    },
    onError: (error: any) => {
      showToast('error', error.message || 'Error al rechazar solicitud');
    },
  });

  const handleApprove = (barber: BarberWithUser) => {
    Alert.alert(
      'Aprobar Barbero',
      `¿Estás seguro que deseas aprobar a ${barber.user.full_name}?\n\nPodrá acceder a la aplicación y gestionar citas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          style: 'default',
          onPress: () => approveMutation.mutate(barber.id),
        },
      ]
    );
  };

  const handleReject = (barber: BarberWithUser) => {
    setSelectedBarber(barber);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      showToast('error', 'Ingresa una razón para el rechazo');
      return;
    }

    if (selectedBarber) {
      rejectMutation.mutate({
        barberId: selectedBarber.id,
        reason: rejectionReason.trim(),
      });
    }
  };

  const renderBarberItem = ({ item }: { item: BarberWithUser }) => (
    <Card style={styles.barberCard} variant="outlined">
      <View style={styles.barberHeader}>
        <Avatar uri={item.user.avatar_url} name={item.user.full_name} size="lg" />
        <View style={styles.barberInfo}>
          <Text style={[styles.barberName, { color: colors.textPrimary }]}>
            {item.user.full_name}
          </Text>
          <Text style={[styles.barberEmail, { color: colors.textSecondary }]}>
            {item.user.email}
          </Text>
          {item.user.phone && (
            <Text style={[styles.barberPhone, { color: colors.textSecondary }]}>
              📞 {item.user.phone}
            </Text>
          )}
          <Text style={[styles.barberDate, { color: colors.textSecondary }]}>
            Solicitó: {format(new Date(item.created_at), "d 'de' MMMM, yyyy", { locale: es })}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Rechazar"
          onPress={() => handleReject(item)}
          variant="outline"
          size="sm"
          style={[styles.actionButton, { borderColor: colors.error }]}
          textStyle={{ color: colors.error }}
          disabled={approveMutation.isPending || rejectMutation.isPending}
        />
        <Button
          title="Aprobar"
          onPress={() => handleApprove(item)}
          variant="primary"
          size="sm"
          style={styles.actionButton}
          loading={approveMutation.isPending}
          disabled={approveMutation.isPending || rejectMutation.isPending}
        />
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>✅</Text>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No hay solicitudes pendientes
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Todas las solicitudes han sido revisadas
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={pendingBarbers}
        renderItem={renderBarberItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      />

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRejectModal(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Rechazar Solicitud
            </Text>

            {selectedBarber && (
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {selectedBarber.user.full_name}
              </Text>
            )}

            <Input
              label="Razón del rechazo"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Ej: No cumple con los requisitos necesarios"
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                variant="outline"
                style={styles.modalButton}
                disabled={rejectMutation.isPending}
              />
              <Button
                title="Rechazar"
                onPress={confirmReject}
                variant="primary"
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                loading={rejectMutation.isPending}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  barberCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  barberHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  barberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  barberName: {
    ...typography.labelLarge,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  barberEmail: {
    ...typography.bodyMedium,
    marginBottom: spacing.xs / 2,
  },
  barberPhone: {
    ...typography.bodySmall,
    marginBottom: spacing.xs / 2,
  },
  barberDate: {
    ...typography.bodySmall,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: spacing.lg,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.bodyLarge,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
