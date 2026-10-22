"use client";

import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI } from "@/lib/contracts";

export function useEthPrice() {
  const [price, setPrice] = useState<number>(3100); // Default estimate

  useEffect(() => {
    let isMounted = true;
    async function fetchPrice() {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        if (res.ok) {
          const data = await res.json();
          if (data?.ethereum?.usd && isMounted) {
            setPrice(data.ethereum.usd);
          }
        }
      } catch {
        // Silent fallback to standard estimate
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 1000 * 60 * 3);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return price;
}

export function useCampaignOnChain(campaignId: number | null) {
  const { data, isLoading, refetch } = useReadContract({
    address: CROWDFUNDING_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "getCampaign",
    args: campaignId ? [BigInt(campaignId)] : undefined,
    query: {
      enabled: !!campaignId && campaignId > 0,
    },
  });

  return {
    campaignOnChain: data,
    isLoading,
    refetch,
  };
}

export function useMilestoneOnChain(campaignId: number | null, milestoneIndex: number) {
  const { data, isLoading, refetch } = useReadContract({
    address: CROWDFUNDING_ADDRESS,
    abi: CROWDFUNDING_ABI,
    functionName: "getMilestone",
    args: campaignId ? [BigInt(campaignId), BigInt(milestoneIndex)] : undefined,
    query: {
      enabled: !!campaignId && campaignId > 0,
    },
  });

  return {
    milestoneOnChain: data,
    isLoading,
    refetch,
  };
}

export function useContribute() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function contribute(campaignId: number, ethAmount: string) {
    return await writeContractAsync({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "contribute",
      args: [BigInt(campaignId)],
      value: parseEther(ethAmount),
    });
  }

  return {
    contribute,
    txHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useCreateCampaignContract() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function createOnChainCampaign(params: {
    goalEth: string;
    durationDays: number;
    fundingType: number; // 0 = AllOrNothing, 1 = Flexible
    metadataURI: string;
    milestoneDescriptions: string[];
    milestonePercentages: number[];
  }) {
    return await writeContractAsync({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "createCampaign",
      args: [
        parseEther(params.goalEth),
        BigInt(params.durationDays),
        params.fundingType,
        params.metadataURI,
        params.milestoneDescriptions,
        params.milestonePercentages.map((p) => BigInt(p)),
      ],
    });
  }

  return {
    createOnChainCampaign,
    txHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useVoteOnMilestone() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function vote(campaignId: number, milestoneIndex: number, approve: boolean) {
    return await writeContractAsync({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "voteOnMilestone",
      args: [BigInt(campaignId), BigInt(milestoneIndex), approve],
    });
  }

  return {
    vote,
    txHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaimRefund() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function claim(campaignId: number) {
    return await writeContractAsync({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "claimRefund",
      args: [BigInt(campaignId)],
    });
  }

  return {
    claim,
    txHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
