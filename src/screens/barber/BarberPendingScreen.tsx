/**
 * BarberPendingScreen
 * Screen shown to barbers whose application is pending approval
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { spacing, typography } from '../../styles/theme';
import { BarberApprovalStatus } from '../../types/models';

interface BarberPendingScreenProps {
  approvalStatus: BarberApprovalStatus;
  rejectionReason?: string;
  barbershopName?: string;
}

export const BarberPendingScreen: React.FC<BarberPendingScreenProps> = ({
  approvalStatus,
  rejectionReason,
  barbershopName,
}) => {
  const { colors } = useThemeStore();
  const { logout } = useAuth();

  const getStatusConfig = () => {
    switch (approvalStatus) {
      case 'pending':
        return {
          icon: '⏳',
          title: 'Solicitud en Revisión',
          message: `Tu solicitud para trabajar en ${barbershopName || 'la barbería'} está siendo revisada por el administrador.`,
          color: colors.warning || '#FFA500',
          showLogout: true,
        };
      case 'rejected':
        return {
          icon: '❌',
          title: 'Solicitud Rechazada',
          message: `Tu solicitud para trabajar en ${barbershopName || 'la barbería'} fue rechazada.`,
          color: colors.error,
          showLogout: true,
        };
      default:
        return {
          icon: '✅',
          title: 'Solicitud Aprobada',
          message: 'Tu solicitud ha sido aprobada. Recarga la aplicación.',
          color: colors.success || '#4CAF50',
          showLogout: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>

        <Card style={[styles.card, { borderColor: config.color }]} variant="outlined">
          <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.title}
            </Text>
          </View>

          <Text style={[styles.message, { color: colors.textPrimary }]}>
            {config.message}
          </Text>

          {approvalStatus === 'pending' && (
            <View style={styles.infoBox}>
              <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
                ¿Qué sigue?
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                • El administrador revisará tu solicitud
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                • Recibirás una notificación cuando sea aprobada
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                • Podrás acceder a todas las funciones de la app
              </Text>
            </View>
          )}

          {approvalStatus === 'rejected' && rejectionReason && (
            <View style={[styles.reasonBox, { backgroundColor: colors.error + '10' }]}>
              <Text style={[styles.reasonTitle, { color: colors.error }]}>
                Razón del rechazo:
              </Text>
              <Text style={[styles.reasonText, { color: colors.textPrimary }]}>
                {rejectionReason}
              </Text>
            </View>
          )}

          {approvalStatus === 'rejected' && (
            <View style={styles.infoBox}>
              <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
                ¿Qué puedes hacer?
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                • Contacta directamente con la barbería
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                • Puedes aplicar a otra barbería
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                • Revisa los requisitos y vuelve a intentarlo
              </Text>
            </View>
          )}
        </Card>

        {config.showLogout && (
          <Button
            title="Cerrar Sesión"
            onPress={logout}
            variant="outline"
            style={styles.logoutButton}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 80,
  },
  card: {
    padding: spacing.lg,
    borderWidth: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  statusText: {
    ...typography.labelLarge,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    ...typography.bodyLarge,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  infoBox: {
    marginTop: spacing.md,
  },
  infoTitle: {
    ...typography.labelLarge,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodyMedium,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  reasonBox: {
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  reasonTitle: {
    ...typography.labelMedium,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  reasonText: {
    ...typography.bodyMedium,
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: spacing.xl,
  },
});
