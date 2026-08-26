import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskInput, SortMode, FilterMode, Priority } from '../types';
import {
  fetchTasks,
  createTaskRequest,
  updateTaskRequest,
  toggleTaskComplete,
  deleteTaskRequest,
} from '../api/taskApi';
import { sortTasks } from '../utils/sortTasks';

const PRIORITY_KEY = '@dailyloop_default_priority';
const SORTING_KEY = '@dailyloop_default_sorting';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  sortMode: SortMode;
  filterMode: FilterMode;
  categoryFilter: string | null;
}

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Task[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPSERT_TASK'; payload: Task }
  | { type: 'REMOVE_TASK'; payload: string }
  | { type: 'SET_SORT'; payload: SortMode }
  | { type: 'SET_FILTER'; payload: FilterMode }
  | { type: 'SET_CATEGORY'; payload: string | null };

const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
  sortMode: 'smart',
  filterMode: 'all',
  categoryFilter: null,
};

function taskReducer(state: TaskState, action: Action): TaskState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, isLoading: false, tasks: action.payload };
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'UPSERT_TASK': {
      const exists = state.tasks.some((t) => t._id === action.payload._id);
      const tasks = exists
        ? state.tasks.map((t) => (t._id === action.payload._id ? action.payload : t))
        : [action.payload, ...state.tasks];
      return { ...state, tasks };
    }
    case 'REMOVE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t._id !== action.payload) };
    case 'SET_SORT':
      return { ...state, sortMode: action.payload };
    case 'SET_FILTER':
      return { ...state, filterMode: action.payload };
    case 'SET_CATEGORY':
      return { ...state, categoryFilter: action.payload };
    default:
      return state;
  }
}

interface TaskContextValue extends TaskState {
  loading: boolean;
  visibleTasks: Task[];
  categories: string[];
  defaultPriority: Priority;
  defaultSorting: SortMode;
  loadTasks: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  addTask: (input: TaskInput) => Promise<void>;
  editTask: (id: string, input: Partial<TaskInput>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  setSortMode: (mode: SortMode) => void;
  setFilterMode: (mode: FilterMode) => void;
  setCategoryFilter: (category: string | null) => void;
  setDefaultPriority: (priority: Priority) => void;
  setDefaultSorting: (sortMode: SortMode) => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [defaultPriority, setDefaultPriorityState] = useState<Priority>('medium');
  const [defaultSorting, setDefaultSortingState] = useState<SortMode>('smart');

  // Load preferences from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(PRIORITY_KEY).then((p) => {
      if (p === 'high' || p === 'medium' || p === 'low') {
        setDefaultPriorityState(p as Priority);
      }
    });
    AsyncStorage.getItem(SORTING_KEY).then((s) => {
      if (s === 'smart' || s === 'dateTime' || s === 'priority' || s === 'deadline') {
        const sortVal = s as SortMode;
        setDefaultSortingState(sortVal);
        dispatch({ type: 'SET_SORT', payload: sortVal });
      }
    });
  }, []);

  const setDefaultPriority = useCallback((priority: Priority) => {
    setDefaultPriorityState(priority);
    AsyncStorage.setItem(PRIORITY_KEY, priority).catch(() => {});
  }, []);

  const setDefaultSorting = useCallback((mode: SortMode) => {
    setDefaultSortingState(mode);
    dispatch({ type: 'SET_SORT', payload: mode });
    AsyncStorage.setItem(SORTING_KEY, mode).catch(() => {});
  }, []);

  const loadTasks = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const tasks = await fetchTasks();
      dispatch({ type: 'LOAD_SUCCESS', payload: tasks });
    } catch (err: any) {
      dispatch({ type: 'LOAD_ERROR', payload: err.message });
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = useCallback(async (input: TaskInput) => {
    const task = await createTaskRequest(input);
    dispatch({ type: 'UPSERT_TASK', payload: task });
  }, []);

  const editTask = useCallback(async (id: string, input: Partial<TaskInput>) => {
    const task = await updateTaskRequest(id, input);
    dispatch({ type: 'UPSERT_TASK', payload: task });
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    const task = await toggleTaskComplete(id);
    dispatch({ type: 'UPSERT_TASK', payload: task });
  }, []);

  const removeTask = useCallback(async (id: string) => {
    await deleteTaskRequest(id);
    dispatch({ type: 'REMOVE_TASK', payload: id });
  }, []);

  const setSortMode = useCallback((mode: SortMode) => {
    dispatch({ type: 'SET_SORT', payload: mode });
  }, []);

  const setFilterMode = useCallback((mode: FilterMode) => {
    dispatch({ type: 'SET_FILTER', payload: mode });
  }, []);

  const setCategoryFilter = useCallback((category: string | null) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  }, []);

  // Derived, memoized list: apply filter -> category -> sort
  const visibleTasks = useMemo(() => {
    let list = state.tasks;

    if (state.filterMode === 'active') list = list.filter((t) => !t.completed);
    if (state.filterMode === 'completed') list = list.filter((t) => t.completed);
    if (state.categoryFilter) {
      list = list.filter((t) => (t.category || 'General') === state.categoryFilter);
    }

    return sortTasks(list, state.sortMode);
  }, [state.tasks, state.filterMode, state.categoryFilter, state.sortMode]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    state.tasks.forEach((t) => set.add(t.category || 'General'));
    return Array.from(set);
  }, [state.tasks]);

  const value = useMemo(
    () => ({
      ...state,
      loading: state.isLoading,
      visibleTasks,
      categories,
      defaultPriority,
      defaultSorting,
      loadTasks,
      fetchTasks: loadTasks,
      addTask,
      editTask,
      toggleComplete,
      toggleTask: toggleComplete,
      removeTask,
      setSortMode,
      setFilterMode,
      setCategoryFilter,
      setDefaultPriority,
      setDefaultSorting,
    }),
    [
      state,
      visibleTasks,
      categories,
      defaultPriority,
      defaultSorting,
      loadTasks,
      addTask,
      editTask,
      toggleComplete,
      removeTask,
      setSortMode,
      setFilterMode,
      setCategoryFilter,
      setDefaultPriority,
      setDefaultSorting,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = (): TaskContextValue => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider');
  return ctx;
};

export type { Priority };
