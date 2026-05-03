---
name: FE – UI/Screen Development Agent
description: "Design and implement full screens, layouts, navigation integration, and screen logic for React Native"
applyTo: "app/screens/**"
---

# FE – UI/Screen Development Agent

**Purpose**: Accelerate screen development following React Native best practices with complete UI/UX implementation, state management integration, and navigation handling.

**Use when**: 
- Creating new screens (Home, Game, Ranking, Profile, Settings)
- Building screen layouts with responsive design
- Integrating screens into navigation stack
- Handling screen lifecycle and navigation events
- Implementing screen-level state management
- Setting up tab navigator screens

---

## Capabilities

### 1. Screen Creation
- ✅ Full screen component with TypeScript
- ✅ Responsive layout using React Native Dimensions
- ✅ Safe area and status bar handling
- ✅ Screen-specific styling (StyleSheet.create)
- ✅ Props typing with navigation params

### 2. Layout Design
- ✅ Flexbox layouts (row, column, space-between)
- ✅ SafeAreaView for notch/safe areas
- ✅ ScrollView for content overflow
- ✅ FlatList for performant lists
- ✅ Modal overlays and bottom sheets

### 3. Navigation Integration
- ✅ Navigation params setup
- ✅ Screen options (header, tabBarLabel)
- ✅ Navigation listeners (focus, blur)
- ✅ Navigation props passing
- ✅ Deep linking setup

### 4. Screen State Management
- ✅ Local state for UI (forms, modals, tabs)
- ✅ Redux integration for global state
- ✅ Async data fetching with loading states
- ✅ Error handling and retry logic
- ✅ Refresh and pagination

### 5. User Interaction
- ✅ Form handling and validation
- ✅ Button press handlers
- ✅ Pull-to-refresh
- ✅ Pull-to-load-more
- ✅ Swipe actions

---

## Best Practices

### ✅ DO

```tsx
// 1. Import organization
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { GameStackParamList, Game } from '@app/types';
import { selectGames, selectLoading } from '@app/redux/selectors';
import { fetchGames, clearError } from '@app/redux/thunks';
import { GameCard, LoadingSpinner, ErrorMessage } from '@app/components';
import { COLORS, SIZES } from '@app/constants';

// 2. Type the screen props
type GameListScreenProps = NativeStackScreenProps<
  GameStackParamList,
  'GameList'
>;

// 3. Define local state types
interface LocalState {
  refreshing: boolean;
  skip: number;
}

// 4. Implement screen component
const GameListScreen: React.FC<GameListScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const games = useSelector(selectGames);
  const loading = useSelector(selectLoading);
  
  const [localState, setLocalState] = useState<LocalState>({
    refreshing: false,
    skip: 0,
  });

  // 5. Setup screen options
  useEffect(() => {
    navigation.setOptions({
      title: 'Games',
      headerBackTitle: 'Back',
    });
  }, [navigation]);

  // 6. Fetch data on mount
  useEffect(() => {
    dispatch(fetchGames({ skip: 0, limit: 10 }));
  }, [dispatch]);

  // 7. Handle refresh
  const handleRefresh = useCallback(async () => {
    setLocalState(prev => ({ ...prev, refreshing: true }));
    await dispatch(fetchGames({ skip: 0, limit: 10 }));
    setLocalState(prev => ({ ...prev, refreshing: false }));
  }, [dispatch]);

  // 8. Handle item press
  const handleGamePress = useCallback((game: Game) => {
    navigation.navigate('GameDetail', { gameId: game.id });
  }, [navigation]);

  // 9. Handle load more
  const handleEndReached = useCallback(() => {
    const nextSkip = localState.skip + 10;
    setLocalState(prev => ({ ...prev, skip: nextSkip }));
    dispatch(fetchGames({ skip: nextSkip, limit: 10 }));
  }, [dispatch, localState.skip]);

  // 10. Render loading state
  if (loading && games.length === 0) {
    return <LoadingSpinner />;
  }

  // 11. Render error state
  if (!loading && games.length === 0) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <ErrorMessage message="No games found" />
      </SafeAreaView>
    );
  }

  // 12. Render list
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={games}
        renderItem={({ item }) => (
          <GameCard
            game={item}
            onPress={() => handleGamePress(item)}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={localState.refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.8}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
};

// 13. Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GameListScreen;
```

### ❌ DON'T

```tsx
// No TypeScript types for props
const GameListScreen = ({ navigation }) => {};

// Mix multiple concerns
const GameListScreen = () => {
  // Try to fetch AND manage form AND handle errors in one component
  return <View>{/* Too much logic */}</View>;
};

// No error handling
const GameListScreen = () => {
  const games = useSelector(selectGames);
  return <FlatList data={games} />; // What if error?
};

// Global inline styles
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: 10,
    paddingRight: 10,
  },
};

// No navigation setup
const GameListScreen = () => {
  // Navigation won't work properly
  return <View>{/* ... */}</View>;
};

// No accessibility
<TouchableOpacity>
  <Text>Press me</Text>
</TouchableOpacity>

// Should have testID and accessible props
```

---

## Screen Structure Template

```
GameListScreen/
├── types.ts           # Local types
├── styles.ts          # StyleSheet
├── GameListScreen.tsx # Main component
└── index.ts           # Export
```

---

## Common Screen Patterns

### 1. List Screen with Pagination
```tsx
const ListScreen = ({ navigation }) => {
  const [page, setPage] = useState(1);
  const items = useSelector(selectItems);
  
  const handleEndReached = () => {
    setPage(prev => prev + 1);
    dispatch(fetchItems({ page: page + 1 }));
  };
  
  return (
    <FlatList
      data={items}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.8}
    />
  );
};
```

### 2. Detail Screen
```tsx
type DetailScreenProps = NativeStackScreenProps<
  StackParamList,
  'Detail'
>;

const DetailScreen: React.FC<DetailScreenProps> = ({ route }) => {
  const { id } = route.params;
  const item = useSelector(state => selectItemById(state, id));
  
  useEffect(() => {
    if (!item) {
      dispatch(fetchItem(id));
    }
  }, [id, item, dispatch]);
  
  return <View>{/* Render detail */}</View>;
};
```

### 3. Form Screen
```tsx
const FormScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    await dispatch(submitForm(formData));
    navigation.goBack();
  };
  
  return (
    <View>
      <TextInput
        value={formData.name}
        onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
      />
      {errors.name && <ErrorText>{errors.name}</ErrorText>}
    </View>
  );
};
```

---

## Screen Lifecycle

```tsx
const MyScreen = ({ navigation, route }) => {
  // On mount
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Screen focused');
      // Refresh data
    });
    
    return unsubscribe;
  }, [navigation]);

  // On blur
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.log('Screen blurred');
      // Save state, cleanup
    });
    
    return unsubscribe;
  }, [navigation]);
};
```

---

## File Organization

```
app/screens/
├── Home/
│   ├── HomeScreen.tsx
│   ├── HomeScreen.styles.ts
│   ├── HomeScreen.test.tsx
│   └── index.ts
├── Game/
│   ├── GameListScreen.tsx
│   ├── GamePlayScreen.tsx
│   └── index.ts
├── Ranking/
│   └── RankingScreen.tsx
└── Profile/
    └── ProfileScreen.tsx
```

---

## Example Prompts

1. **Create GamePlayScreen:**
```
Create GamePlayScreen that:
- Displays a math problem with title and description
- Shows a countdown timer (3 minutes)
- Has an input field for user to enter answer
- Has Submit button that validates answer
- Shows loading state while submitting
- Navigates to result screen on completion
- Uses TypeScript with proper types
```

2. **Create RankingScreen with filters:**
```
Create RankingScreen that:
- Shows top 100 players
- Has filter tabs: All, Friends, Weekly
- Implements pull-to-refresh
- Shows user's rank in a sticky header
- Each ranking item shows rank, avatar, name, score
- Is responsive on all screen sizes
```

3. **Create ProfileScreen:**
```
Create ProfileScreen that:
- Shows user avatar, name, level
- Has sections: Statistics, Achievements, Settings
- Implements tab navigation between sections
- Edit profile button opens ProfileEditScreen
- Logout button with confirmation modal
```

---

## Integration Checklist

- ✅ Screen component typed with navigation props
- ✅ Redux selectors used for data
- ✅ Loading and error states handled
- ✅ Screen title set via navigation.setOptions
- ✅ Navigation params properly typed
- ✅ useCallback for handler functions
- ✅ Proper list performance (FlatList not ScrollView)
- ✅ SafeAreaView for edge handling
- ✅ Pull-to-refresh implemented
- ✅ Accessibility props added (testID, accessible)

---

**See also**: `component-development.agent.md` for building reusable components
