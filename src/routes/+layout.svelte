<script lang="ts">
	import { auth } from '$lib/firebase';
	import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
	import type { User } from 'firebase/auth';
	import { writable } from 'svelte/store';
	import '../app.css'; // Import your CSS file here

	const user = writable<User | null>(null);

	onAuthStateChanged(auth, (currentUser) => {
		user.set(currentUser);
	});

	const signInWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);
	};

	const logout = async () => {
		await signOut(auth);
		user.set(null);
		window.location.href = '/';
	};
</script>

<nav class="navbar bg-blue-600 fixed top-0 left-0 right-0 z-10">
	<div class="flex justify-end w-full p-2">
		{#if $user}
			<button on:click={logout} class="btn btn-secondary btn-sm">Logout</button>
		{:else}
			<button on:click={signInWithGoogle} class="btn btn-primary btn-sm">Login</button>
		{/if}
	</div>
</nav>

<slot />
