<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Logo } from '$lib/components/app/misc';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { APP_NAME, ROUTES } from '$lib/constants';
	import { authStore } from '$lib/stores';

	let username = $state('');
	let password = $state('');
	let isSubmitting = $state(false);
	let localError = $state('');

	const canSubmit = $derived(username.trim().length > 0 && password.trim().length > 0);
	const title = $derived(APP_NAME === 'llama-ui' ? 'Snap' : APP_NAME);

	async function handleSubmit() {
		if (!canSubmit || isSubmitting) return;

		isSubmitting = true;
		localError = '';

		try {
			await authStore.login(username.trim(), password);
			await goto(`${base}${ROUTES.START}`, { replaceState: true });
		} catch {
			localError = authStore.error ?? 'Invalid username or password.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<main class="flex min-h-dvh items-center justify-center bg-background px-4 py-8 text-foreground">
	<Card.Root class="w-full max-w-sm gap-5 rounded-2xl border-border/50 bg-card/80 px-6 py-6 shadow-sm">
		<Card.Header class="px-0">
			<div class="mb-3 flex items-center gap-3">
				<div class="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground">
					<Logo class="h-4 w-4" />
				</div>

				<p class="text-sm font-semibold">{title}</p>
			</div>

			<Card.Title class="text-xl">Sign in to Snap</Card.Title>
			<Card.Description>Sign in to continue</Card.Description>
		</Card.Header>

		<Card.Content class="px-0">
			<form class="space-y-4" onsubmit={(event) => {
				event.preventDefault();
				void handleSubmit();
			}}>
				<div class="space-y-2">
					<Label for="snap-username">Username</Label>
					<Input
						aria-invalid={Boolean(localError)}
						autocomplete="username"
						bind:value={username}
						disabled={isSubmitting}
						id="snap-username"
						required
						type="text"
					/>
				</div>

				<div class="space-y-2">
					<Label for="snap-password">Password</Label>
					<Input
						aria-invalid={Boolean(localError)}
						autocomplete="current-password"
						bind:value={password}
						disabled={isSubmitting}
						id="snap-password"
						required
						type="password"
					/>
				</div>

				{#if localError}
					<Alert class="py-2" variant="destructive">
						<AlertDescription>{localError}</AlertDescription>
					</Alert>
				{/if}

				<Button class="w-full" disabled={!canSubmit || isSubmitting} type="submit">
					{#if isSubmitting}
						<LoaderCircle class="h-4 w-4 animate-spin" />
					{/if}

					Sign in
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</main>
