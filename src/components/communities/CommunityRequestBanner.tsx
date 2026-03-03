"use client"
import React from "react"
import { Button } from "../ui/button"
import Image from "next/image"
import "./CommunityRequestBannerStyle.css"

function CommunityRequestBanner() {
  return (
    <div className="community-request-Banner">
      <div className="banner-content">
        <p className="banner-title">Build Your Own University Community</p>
        <p className="banner-description">
          Create a private space for your projects, FYPs, and collaborations.
          Manage your own community and connect with peers in a focused
          environment. Take control and bring your ideas to life!
        </p>
        <Button>Request to Create Community</Button>
      </div>
      <Image
        src="images/community_request_banner.svg"
        alt="Community Crowd"
        width={400}
        height={200}
        className="banner-image"
      />
    </div>
  )
}

export default CommunityRequestBanner
