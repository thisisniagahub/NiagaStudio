import React, { useState } from 'react';

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, isOpen, onClick, children }) => (
    <div className="border-b border-border">
        <h2>
            <button
                type="button"
                className="flex items-center justify-between w-full p-5 font-medium text-left text-text"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <span className="text-lg text-primary">{title}</span>
                <svg
                    className={`w-3 h-3 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                >
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
                </svg>
            </button>
        </h2>
        {isOpen && (
            <div className="p-5 border-t-0 border-border">
                <div className="space-y-4 text-textSecondary leading-relaxed">
                   {children}
                </div>
            </div>
        )}
    </div>
);


export const LearnPanel: React.FC = () => {
    const [openSection, setOpenSection] = useState<string | null>('philosophy');

    const toggleSection = (title: string) => {
        setOpenSection(openSection === title ? null : title);
    };

    const sections = [
        {
            title: "Falsafah: Estetika Melebihi Kebolehbacaan",
            key: "philosophy",
            content: (
                <>
                    <p>Kaligrafi Arab mempunyai dua bentuk: hiasan dan komunikatif. Kufic Geometrik tergolong dalam kaligrafi hiasan, di mana tujuan utamanya adalah untuk mencipta bentuk estetik dan bukannya menyampaikan mesej yang boleh dibaca dengan mudah. Seni ini terletak pada transformasi huruf menjadi reka bentuk geometri yang harmoni.</p>
                    <p>Sama seperti lirik yang sukar difahami dalam muzik opera atau Gothik tidak mengurangkan nilai seninya, kebolehbacaan Kufic Geometrik adalah sekunder kepada keindahan visualnya. Idea bahawa terdapat satu bentuk seni di hadapan kita sudah cukup untuk kita menikmati karya tersebut, walaupun konteks tambahan boleh membantu penonton menghargai kepentingan budaya dan sejarahnya.</p>
                </>
            )
        },
        {
            title: "Seni Sebagai Teka-Teki",
            key: "puzzle",
            content: (
                <>
                    <p>Mencipta reka bentuk Kufic Geometrik adalah satu proses yang menggabungkan seni dengan penyelesaian masalah. Artis berhadapan dengan cabaran untuk menyusun huruf dalam grid yang terhad, di mana setiap segiempat yang diletakkan akan mengurangkan ruang kosong yang ada. Proses ini memerlukan perancangan yang teliti, kesabaran, dan kemahiran menyelesaikan masalah yang tinggi.</p>
                    <p>Apabila karya seni itu berkembang, tugas untuk mengisi ruang yang tinggal menjadi semakin sukar. Setiap huruf yang telah siap akan mengehadkan pilihan reka bentuk untuk huruf seterusnya, mewujudkan satu teka-teki visual di mana artis mesti memastikan setiap elemen seimbang dengan yang lain. Ia adalah satu gabungan antara kreativiti, pengiraan, dan strategi.</p>
                    <p>Bagi penonton, mengalami karya Kufic Geometrik boleh diibaratkan seperti meneroka sebuah labirin. Mereka mesti mengikuti laluan dan menyambungkan titik-titik untuk merungkai perkataan-perkataan yang terkandung di dalamnya. Setiap komponen seni adalah sebahagian daripada teka-teki, dan apabila semuanya disambungkan dengan betul, keindahan dan kebijaksanaan karya itu akan terserlah sepenuhnya.</p>
                </>
            )
        },
        {
            title: "Asal Usul & Pengaruh",
            key: "origin",
            content: (
                <>
                    <p>Asal usul Kufic Geometrik adalah subjek perdebatan. Satu teori mencadangkan ia berkembang daripada amalan seni bina menggunakan corak bata pada grid. Satu lagi teori yang menarik mencadangkan pengaruh daripada skrip mohor Cina, hasil daripada pertukaran budaya sekitar seribu tahun yang lalu.</p>
                    <p>Terdapat banyak persamaan visual antara kedua-dua gaya: kedua-duanya menggunakan sistem grid, tidak mempunyai titik atau diakritik, dan membenarkan putaran huruf. Keseimbangan antara pepejal dan lompang adalah simbol penting dalam kedua-dua budaya Cina dan Islam, yang selanjutnya menyokong teori kemungkinan pengaruh silang budaya ini.</p>
                </>
            )
        },
        {
            title: "Penamaan: Lebih Daripada Sekadar 'Segiempat'",
            key: "naming",
            content: (
                <>
                    <p>Walaupun sering dipanggil 'Square Kufic', nama ini tidak begitu tepat. 'Square Kufic' secara khusus merujuk kepada reka bentuk yang terkandung dalam bingkai segi empat sama. Istilah yang lebih tepat dan inklusif ialah 'Geometric Kufic'.</p>
                    <p>Geometric Kufic merangkumi pelbagai bentuk, termasuk reka bentuk segi tiga, pentagon, atau heksagon, dan dianggap sebagai yang terakhir daripada enam variasi Kufi utama. Memahami perbezaan ini membantu kita menghargai skop yang lebih luas dan kepelbagaian bentuk seni yang indah ini.</p>
                </>
            )
        }
    ];

    return (
        <div className="bg-surface rounded-lg shadow-md border border-border max-w-4xl mx-auto text-text overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-3xl font-bold text-center tracking-tight">Dunia Kufic Geometrik</h2>
                <p className="text-center text-textSecondary mt-2">Terokai prinsip dan sejarah di sebalik bentuk seni yang memukau ini.</p>
            </div>
            
            <div id="accordion-flush">
                {sections.map(section => (
                    <AccordionSection
                        key={section.key}
                        title={section.title}
                        isOpen={openSection === section.key}
                        onClick={() => toggleSection(section.key)}
                    >
                        {section.content}
                    </AccordionSection>
                ))}
            </div>
        </div>
    );
};