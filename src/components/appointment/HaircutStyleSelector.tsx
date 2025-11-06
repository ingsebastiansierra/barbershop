/**
 * HaircutStyleSelector
 * Component for selecting a haircut style during appointment booking
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { HaircutStyle } from '../../types/models';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

interface HaircutStyleSelectorProps {
  styles: HaircutStyle[];
  selectedStyleId?: string;
  onSelectStyle: (style: HaircutStyle) => void;
  loading?: boolean;
}

export const HaircutStyleSelector: React.FC<HaircutStyleSelectorProps> = ({
  styles,
  selectedStyleId,
  onSelectStyle,
  loading = false,
}) => {
  const { colors } = useThemeStore();

  const renderStyleItem = ({ item }: { item: HaircutStyle }) => {
    const isSelected = selectedStyleId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles_local.styleCard,
          {
            backgroundColor: colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => onSelectStyle(item)}
        activeOpacity={0.7}
      >
        {/* Image */}
        <View style={styles_local.imageContainer}>
          <Image
            source={{ uri: item.image_url }}
            style={styles_local.image}
            resizeMode="cover"
          />
          {isSelected && (
            <View style={[styles_local.selectedBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles_local.infoContainer}>
          <Text
            style={[
              styles_local.styleName,
              { color: isSelected ? colors.primary : colors.textPrimary },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.description && (
            <Text
              style={[styles_local.styleDescription, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles_local.emptyState}>
      <Ionicons name="cut-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles_local.emptyText, { color: colors.textSecondary }]}>
        No hay estilos disponibles
      </Text>
      <Text style={[styles_local.emptySubtext, { color: colors.textDisabled }]}>
        Por favor, actualiza tu género en el perfil
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles_local.loadingContainer}>
        <Text style={[styles_local.loadingText, { color: colors.textSecondary }]}>
          Cargando estilos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <Ionicons name="cut" size={24} color={colors.primary} />
        <Text style={[styles_local.title, { color: colors.textPrimary }]}>
          Elige tu estilo de corte
        </Text>
      </View>
      <Text style={[styles_local.subtitle, { color: colors.textSecondary }]}>
        Selecciona el estilo que deseas para tu cita (opcional)
      </Text>

      {styles.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles_local.gridContainer}>
          {styles.map((item, index) => {
            if (index % 2 === 0) {
              const nextItem = styles[index + 1];
              return (
                <View key={item.id} style={styles_local.row}>
                  {renderStyleItem({ item })}
                  {nextItem && renderStyleItem({ item: nextItem })}
                </View>
              );
            }
            return null;
          })}
        </View>
      )}
    </View>
  );
};

const styles_local = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  gridContainer: {
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  styleCard: {
    width: ITEM_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  infoContainer: {
    padding: 12,
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  styleDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
