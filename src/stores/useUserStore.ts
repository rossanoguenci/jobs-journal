import {create} from 'zustand'
import type {UserProfile} from '@/types/UserProfile'

export type UserState = {
    user: UserProfile | null
    avatar: string | null
}

export type UserActions = {
    setUser: (user: UserProfile | null) => void
    clearUser: () => void
    setAvatar: (avatar: string | null) => void
}

export type UserStore = UserState & UserActions

export const useUserStore =
    create<UserStore>((set) => ({
            user: null,
            avatar: null,
            setUser: (user) => set({user: user}),
            clearUser: () => set({user: null, avatar: null}),
            setAvatar: (avatar) => set({avatar: avatar}),
        })
    );
