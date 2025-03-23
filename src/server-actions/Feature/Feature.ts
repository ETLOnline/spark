'use server'

import { attachSpaceFeatures } from '@/src/db/data-access/spaces/query';
import { SelectFeature } from "@/src/db/schema";
import { CreateServerAction } from "..";
import { getFeatures } from "@/src/db/data-access/feature/query";


export const getFeaturesAction = CreateServerAction(true, async(filters?: Partial<SelectFeature>)=>{

    try {
      const features = await getFeatures(filters);
      return { success: true, data: features }
    }
    catch(error){
      return { error: error, data: [] }
    }

})

export const attachSpaceFeaturesAction = CreateServerAction(true, async(spaceId: string , featureIds: number[])=>{

  try {
    const space = await attachSpaceFeatures(spaceId, featureIds);
    return { success: true, data: space }
  }
  catch(error){
    return { error: error, data: [] }
  }

})