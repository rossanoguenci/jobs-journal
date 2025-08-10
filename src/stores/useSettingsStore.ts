import {create} from 'zustand';
import {AppSettings} from "@/types/AppSettings";

//todo: destructuring the settings object
type OptionsState = {
    appSettings: AppSettings | null;
};

type OptionsActions = {
    setAppSettings: (settings: AppSettings | null) => void;
};

type OptionsStore = OptionsState & OptionsActions;

export const useSettingsStore = create<OptionsStore>((set) => ({
    appSettings: null,
    setAppSettings: (settings) => set({appSettings: settings}),
}));