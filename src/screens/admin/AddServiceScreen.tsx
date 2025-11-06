/**
 * AddServiceScreen
 * Screen for adding a new service to the barbershop
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../../store/themeStore';
import { useAdminBarbershop } from '../../hooks/useAdminBarbershop';
import { serviceService } from '../../services/service.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AdminStackParamList } from '../../types/navigation';
import { Service } from '../../types/models';
import { spacing, typography, borderRadius } from '../../styles/theme';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

export const AddServiceScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { data: barbershop, isLoading: barbershopLoading } = useAdminBarbershop();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [price, setPrice] = useState('');
  const [isCombo, setIsCombo] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState('10');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch available services for combo creation
  const { data: availableServices } = useQuery({
    queryKey: ['services', barbershop?.id],
    queryFn: () =>
      serviceService.getServices({
        barbershop_id: barbershop!.id,
        is_active: true,
        is_combo: false,
      }),
    enabled: !!barbershop && isCombo,
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async () => {
      // Validate form
      const newErrors: Record<string, string> = {};

      if (!name.trim()) {
        newErrors.name = 'El nombre es requerido';
      }

      const duration = parseInt(durationMinutes);
      if (isNaN(duration) || duration <= 0) {
        newErrors.duration = 'La duración debe ser un número positivo';
      } else if (duration % 15 !== 0) {
        newErrors.duration = 'La duración debe ser múltiplo de 15 minutos';
      }

      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue < 0) {
        newErrors.price = 'El precio debe ser un número positivo';
      }

      if (isCombo && selectedServices.length < 2) {
        newErrors.combo = 'Un combo debe incluir al menos 2 servicios';
      }

      if (isCombo) {
        const discount = parseFloat(discountPercentage);
        if (isNaN(discount) || discount < 0 || discount > 100) {
          newErrors.discount = 'El descuento debe estar entre 0 y 100';
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Por favor corrige los errores en el formulario');
      }

      // Create service
      if (isCombo) {
        await serviceService.createCombo(
          barbershop!.id,
          name,
          description,
          selectedServices,
          parseFloat(discountPercentage)
        );
      } else {
        await serviceService.createService({
          barbershop_id: barbershop!.id,
          name,
          description: description || undefined,
          duration_minutes: duration,
          price: priceValue,
          is_combo: false,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      Alert.alert('Éxito', 'Servicio agregado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'No se pudo agregar el servicio');
    },
  });

  const handleToggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
    if (errors.combo) setErrors({ ...errors, combo: '' });
  };

  const handleSubmit = () => {
    setErrors({});
    createServiceMutation.mutate();
  };

  if (barbershopLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Service Type Selection */}
      <Card style={styles.section} variant="outlined">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Tipo de servicio
        </Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              !isCombo && { backgroundColor: colors.primary },
              { borderColor: colors.border },
            ]}
            onPress={() => setIsCombo(false)}
          >
            <Text
              style={[
                styles.typeButtonText,
                { color: !isCombo ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              Servicio individual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              isCombo && { backgroundColor: colors.primary },
              { borderColor: colors.border },
            ]}
            onPress={() => setIsCombo(true)}
          >
            <Text
              style={[
                styles.typeButtonText,
                { color: isCombo ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              Combo
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Basic Information */}
      <Card style={styles.section} variant="outlined">
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Información básica
        </Text>

        <Input
          label="Nombre del servicio"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          placeholder="Ej: Corte de cabello"
          error={errors.name}
        />

        <Input
          label="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe el servicio"
          multiline
          numberOfLines={3}
        />

        {!isCombo && (
          <>
            <Input
              label="Duración (minutos)"
              value={durationMinutes}
              onChangeText={(text) => {
                setDurationMinutes(text);
                if (errors.duration) setErrors({ ...errors, duration: '' });
              }}
              placeholder="30"
              keyboardType="numeric"
              error={errors.duration}
            />

            <Input
              label="Precio"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                if (errors.price) setErrors({ ...errors, price: '' });
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={errors.price}
            />
          </>
        )}
      </Card>

      {/* Combo Configuration */}
      {isCombo && (
        <>
          <Card style={styles.section} variant="outlined">
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Servicios incluidos
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Selecciona los servicios que incluirá el combo
            </Text>

            {errors.combo && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.combo}
              </Text>
            )}

            {availableServices && availableServices.length > 0 ? (
              <View style={styles.servicesList}>
                {availableServices.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceItem,
                      {
                        borderColor: selectedServices.includes(service.id)
                          ? colors.primary
                          : colors.border,
                        backgroundColor: selectedServices.includes(service.id)
                          ? colors.primary + '10'
                          : 'transparent',
                      },
                    ]}
                    onPress={() => handleToggleService(service.id)}
                  >
                    <View style={styles.serviceItemInfo}>
                      <Text style={[styles.serviceItemName, { color: colors.textPrimary }]}>
                        {service.name}
                      </Text>
                      <Text style={[styles.serviceItemDetails, { color: colors.textSecondary }]}>
                        {serviceService.formatDuration(service.duration_minutes)} • $
                        {service.price.toFixed(2)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selectedServices.includes(service.id)
                            ? colors.primary
                            : colors.border,
                          backgroundColor: selectedServices.includes(service.id)
                            ? colors.primary
                            : 'transparent',
                        },
                      ]}
                    >
                      {selectedServices.includes(service.id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={[styles.noServicesText, { color: colors.textSecondary }]}>
                No hay servicios disponibles para crear combos. Crea servicios individuales
                primero.
              </Text>
            )}
          </Card>

          <Card style={styles.section} variant="outlined">
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Descuento del combo
            </Text>
            <Input
              label="Porcentaje de descuento"
              value={discountPercentage}
              onChangeText={(text) => {
                setDiscountPercentage(text);
                if (errors.discount) setErrors({ ...errors, discount: '' });
              }}
              placeholder="10"
              keyboardType="numeric"
              error={errors.discount}
            />
            <Text style={[styles.discountHint, { color: colors.textSecondary }]}>
              El precio del combo se calculará automáticamente aplicando este descuento al
              precio total de los servicios seleccionados.
            </Text>
          </Card>
        </>
      )}

      <View style={styles.actions}>
        <Button
          title="Cancelar"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Agregar servicio"
          onPress={handleSubmit}
          variant="primary"
          style={styles.actionButton}
          loading={createServiceMutation.isPending}
        />
      </View>
    </ScrollView>
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
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonText: {
    ...typography.labelMedium,
  },
  servicesList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  serviceItemInfo: {
    flex: 1,
  },
  serviceItemName: {
    ...typography.labelMedium,
    marginBottom: spacing.xs / 2,
  },
  serviceItemDetails: {
    ...typography.bodySmall,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  noServicesText: {
    ...typography.bodyMedium,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  discountHint: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  errorText: {
    ...typography.bodySmall,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});
