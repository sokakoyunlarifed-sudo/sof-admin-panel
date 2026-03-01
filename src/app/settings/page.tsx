'use client';

import React from 'react';
import DeployButton from './_components/DeployButton';
import ChangePasswordModal from './_components/ChangePasswordModal';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
                <h2 className="mb-4 text-xl font-semibold text-dark dark:text-white">Genel Ayarlar</h2>

                <div className="divide-y divide-stroke dark:divide-dark-3">
                    <div className="flex items-center justify-between py-5">
                        <div>
                            <h3 className="font-medium text-dark dark:text-white">Site Güncelleme</h3>
                            <p className="text-sm text-dark-6">Yapılan değişiklikleri web sitesine yansıtmak için içeriği yeniden oluşturun.</p>
                        </div>
                        <DeployButton />
                    </div>

                    <div className="flex items-center justify-between py-5">
                        <div>
                            <h3 className="font-medium text-dark dark:text-white">Güvenlik</h3>
                            <p className="text-sm text-dark-6">Hesap şifrenizi buradan güncelleyebilirsiniz.</p>
                        </div>
                        <ChangePasswordModal />
                    </div>
                </div>
            </div>
        </div>
    );
}