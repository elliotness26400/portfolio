// 'use client'

import { BlogHeader } from "@/app/component/blog/header";
import { BlogMain } from "@/app/component/blog/textField";
import Image from "next/image";
import { blogsDatas } from "@/app/data/blog";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

    const id = (await params).id;

    const data = blogsDatas[id];

    if(!data) return (
        <div>WRONG ID</div>
    )

    return (
        <div className="map">
            <BlogHeader data={data.header}/>
            <BlogMain data={data.main}/>
        </div>
    );
}
