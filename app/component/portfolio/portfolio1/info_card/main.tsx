import Image from "next/image";
import style from "./page.module.scss";

type SocialLinks = {
    github?: string;
    linkedin?: string;
    instagram?: string;
    x?: string;
};

type InfoCardData = {
    name?: string;
    description?: string;
    image?: string;
    socials?: SocialLinks;
};

const socialProfiles: { key: keyof SocialLinks; label: string; url: string }[] = [
    { key: "github", label: "GitHub", url: "https://github.com/Yokachii" },
    { key: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/elliot-deconinck" },
    // { key: "instagram", label: "Instagram", url: "https://www.instagram.com/" },
];

function SocialMark({ name }: { name: keyof SocialLinks }) {
    if (name === "github") {
        return <path d="M12 2.5a9.5 9.5 0 0 0-3 18.52c.48.09.65-.2.65-.46v-1.67c-2.65.58-3.21-1.13-3.21-1.13-.44-1.1-1.06-1.39-1.06-1.39-.87-.6.07-.59.07-.59.96.07 1.47.98 1.47.98.86 1.47 2.25 1.05 2.8.8.09-.62.34-1.05.61-1.29-2.12-.24-4.35-1.06-4.35-4.72 0-1.04.37-1.9.98-2.57-.1-.24-.43-1.22.09-2.54 0 0 .8-.26 2.61.98a9.1 9.1 0 0 1 4.75 0c1.81-1.24 2.61-.98 2.61-.98.52 1.32.19 2.3.09 2.54.61.67.98 1.53.98 2.57 0 3.67-2.24 4.48-4.37 4.71.35.3.65.88.65 1.78v2.63c0 .26.17.56.66.46A9.5 9.5 0 0 0 12 2.5Z" />;
    }

    if (name === "linkedin") {
        return <><path d="M5.5 8.5v10" /><path d="M5.5 5.5h.01" /><path d="M10 18.5v-5.4a3.1 3.1 0 0 1 6.2 0v5.4" /><path d="M10 10v8.5" /></>;
    }

    if (name === "instagram") {
        return <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.6 6.5h.01" /></>;
    }

    return <path d="M18.9 3.5h2.8l-6.1 7 7.2 10h-5.6l-4.4-6.1-5.3 6.1H4.7l6.5-7.5-6.9-9.5h5.8l4 5.6 4.8-5.6Zm-1 15.2h1.5L9.5 5.2H7.9l10 13.5Z" />;
}

export function InfoCard({ data }: { data: InfoCardData }) {
    return (
        <article className={`${style.card} cursor-light`}>
            <div className={style.imageFrame}>
                <Image
                    className={style.portrait}
                    src={data.image ?? "/tete.jpg"}
                    alt={`${data.name ?? "Profile"} portrait`}
                    fill
                    priority
                    sizes="(max-width: 700px) 90vw, 35vw"
                    unoptimized
                />
            </div>

            <div className={style.details}>
                <h1 className={style.name}>{data.name ?? "NAME"}</h1>
                <p className={style.description}>
                    {data.description ?? "A creative developer building thoughtful digital experiences."}
                </p>

                <div className={style.socials} aria-label="Social media links">
                    {socialProfiles.map(({ key, label, url }) => (
                        <a
                            className={style.socialLink}
                            href={data.socials?.[key] ?? url}
                            key={key}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={label}
                            title={label}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className={style.socialIcon}>
                                <SocialMark name={key} />
                            </svg>
                        </a>
                    ))}
                </div>
            </div>
        </article>
    );
}