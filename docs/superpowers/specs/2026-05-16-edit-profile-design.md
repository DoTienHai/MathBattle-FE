# Edit Profile Implementation Design

**Feature:** G01_F02_SF04 — Update Profile Info  
**Date:** 2026-05-16  
**Status:** Approved

---

## Goal

Allow users to edit their `username` and `full_name` directly from the Profile screen via a pencil icon button in the ProfileHeader.

## Architecture

A pencil icon (`create-outline` from Ionicons) is rendered in the top-right area of the `ProfileHeader` component. Tapping it opens a `Modal` overlay containing a form with two text inputs pre-filled with the user's current values. On save, the app calls `PATCH /api/v1/profile`, updates Redux `basicInfo` state with the returned data, and closes the modal.

No new navigation screen is needed — the modal keeps the user in context on the Profile tab.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `types/profile.ts` | Modify | Add `UpdateProfilePayload`, `UpdateProfileData`, `UpdateProfileResponse`, `loading.update`, `error.update` to `ProfileState` |
| `services/profileService.ts` | Modify | Add `updateProfile(username?, fullName?)` method |
| `redux/slices/profileSlice.ts` | Modify | Add `loading.update` + `error.update` states; add `extraReducers` for `updateProfile` thunk |
| `redux/thunks/profileThunks.ts` | Modify | Add `updateProfile` async thunk |
| `redux/selectors/profileSelectors.ts` | Modify | No changes needed — `selectProfileLoading` and `selectProfileError` already cover `update` |
| `components/profile/ProfileHeader.tsx` | Modify | Add `onEditPress` prop; render pencil icon button |
| `components/profile/EditProfileModal.tsx` | Create | Modal with username + fullName inputs, inline validation, Save/Cancel buttons |
| `screens/profile/ProfileScreen.tsx` | Modify | Wire `onEditPress` to open `EditProfileModal`; pass thunk dispatch |

---

## API

**PATCH** `/api/v1/profile`

Request body (both optional, at least one required):
```json
{ "username": "hải_tiến", "full_name": "Hải Tiến" }
```

Success response (200):
```json
{ "success": true, "data": { "user_id": 1, "username": "hải_tiến", "full_name": "Hải Tiến" }, "error": null }
```

Error codes:
| Code | HTTP | Condition |
|------|------|-----------|
| `USERNAME_TAKEN` | 409 | Username already used by another account |
| `NO_FIELDS_TO_UPDATE` | 400 | Both fields unchanged/absent |
| Pydantic error | 422 | Length or whitespace constraint violated |

---

## Redux State Changes

Add to `ProfileState.loading`: `update: boolean`  
Add to `ProfileState.error`: `update: string | null`

The `updateProfile` thunk:
- Accepts `{ username?: string; fullName?: string }`
- On success: maps `user_id → userId`, `username`, `full_name → fullName`; merges into `state.basicInfo`
- On failure: stores error message in `state.error.update`

After a successful save, the `basicInfo` in Redux is updated in-place so the ProfileHeader re-renders immediately with the new name/username without a full reload.

---

## UI Components

### ProfileHeader changes
- New optional prop: `onEditPress: () => void`
- Pencil icon (`create-outline`, size 20, color `rgba(255,255,255,0.85)`) rendered as a `TouchableOpacity` in the top-right corner of the header
- Only renders the button when `onEditPress` is provided and `!isLoading`

### EditProfileModal (new)
- Full-screen transparent overlay, fade animation, `KeyboardAvoidingView`
- White card (borderRadius 16, paddingHorizontal 24)
- Title: "Edit Profile"
- Two `TextInput` fields:
  - **Username**: pre-filled, label above, inline error below, `autoCapitalize="none"`, `autoCorrect={false}`
  - **Full Name**: pre-filled, label above, inline error below
- Client-side validation before submit:
  - Username: 3–30 chars, no whitespace (regex `/\s/`)
  - Full Name: 1–100 chars after trim
- **Save** button: disabled when no field has changed from original values OR when `loading.update` is true
- **Cancel** button: closes modal, resets form to original values
- On API error `USERNAME_TAKEN`: display "This username is already taken" under username field
- On 422 (Pydantic): display the BE error message as a general error

---

## Data Flow

```
User taps pencil icon
  → ProfileScreen sets modalVisible = true
  → EditProfileModal renders pre-filled with basicInfo.username, basicInfo.fullName

User edits fields → taps Save
  → Client validation passes
  → dispatch(updateProfile({ username?, fullName? }))
    → PATCH /api/v1/profile
    → success: merge returned data into state.basicInfo → close modal
    → failure: set state.error.update → show inline error in modal
```

---

## Validation Rules (client-side mirrors BE)

| Field | Rule |
|-------|------|
| `username` | 3–30 chars; regex `\S+` (no whitespace); if unchanged from current, omit from request |
| `fullName` | 1–100 chars after trim; if unchanged from current, omit from request |
| Both unchanged | Save button is disabled — request never sent |

---

## Out of Scope

- Avatar/photo upload
- Username change cooldown
- Email or password change
