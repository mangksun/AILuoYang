import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as aiApi from '@/api/ai';
import type { ItineraryPlan, ItineraryRequest } from '@/api/ai';

export const useItineraryStore = defineStore('itinerary', () => {
  const loading = ref(false);
  const currentPlan = ref<ItineraryPlan | null>(null);

  async function generate(payload: ItineraryRequest) {
    loading.value = true;
    try {
      currentPlan.value = await aiApi.generateItinerary(payload);
      return currentPlan.value;
    } finally {
      loading.value = false;
    }
  }

  return { loading, currentPlan, generate };
});
