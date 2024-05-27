<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { database, auth } from '$lib/firebase';
	import { ref, push, onValue } from 'firebase/database';
	import { writable } from 'svelte/store';
	import type { Writable } from 'svelte/store';
	import { user } from '$lib/stores/auth';
	import { onAuthStateChanged } from 'firebase/auth';

	interface Message {
		content: string;
		timestamp: string;
		userId: string;
		userName: string;
	}

	let message = '';
	const messages: Writable<Message[]> = writable([]);
	let unsubscribe: () => void;

	const fetchMessages = () => {
		const messagesRef = ref(database, 'messages');
		onValue(messagesRef, (snapshot) => {
			const data = snapshot.val();
			const loadedMessages: Message[] = data ? Object.values(data) : [];
			messages.set(loadedMessages);
		});
	};

	onAuthStateChanged(auth, (currentUser) => {
		if (currentUser) {
			fetchMessages();
		} else {
			messages.set([]);
		}
	});

	const sendMessage = async () => {
		if (message.trim()) {
			await push(ref(database, 'messages'), {
				content: message,
				timestamp: new Date().toISOString(),
				userId: auth.currentUser?.uid,
				userName: auth.currentUser?.displayName
			});
			message = '';
		}
	};

	const handleKeyDown = async (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			await sendMessage();
		}
	};

	let messagesContainer: HTMLDivElement;

	onMount(() => {
		scrollToBottom();
	});

	afterUpdate(() => {
		scrollToBottom();
	});

	const scrollToBottom = () => {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	};
</script>

{#if $user}
	<div class="flex flex-col h-screen">
		<div class="flex-grow overflow-y-auto w-full pb-12" bind:this={messagesContainer}>
			<div class="max-w-2xl mx-auto p-4">
				{#each $messages as msg (msg.timestamp)}
					<div class="message bg-gray-100 p-2 mb-2 rounded">
						<strong>{msg.userName}</strong>: {msg.content}
					</div>
				{/each}
			</div>
		</div>
		<div class="w-full flex items-center px-4 pb-4 bg-white fixed bottom-0 left-0 right-0">
			<div class="max-w-2xl w-full mx-auto flex items-center">
				<input
					bind:value={message}
					placeholder="Type your message"
					class="input input-bordered flex-grow mr-2"
					on:keydown={handleKeyDown}
				/>
				<button on:click={sendMessage} class="btn btn-primary">Send</button>
			</div>
		</div>
	</div>
{:else}
	<div class="flex justify-center items-center h-screen">
		<p>Please login to view and send messages.</p>
	</div>
{/if}

<style>
	.message {
		margin-bottom: 10px;
	}
</style>
