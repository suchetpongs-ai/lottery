export default function PrivacyPage() {
    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-heading font-bold text-gradient mb-8">
                    นโยบายความเป็นส่วนตัว
                </h1>

                <div className="glass-card p-8 space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">
                            1. ข้อมูลที่เรารวบรวม
                        </h2>
                        <p className="mb-2">เรารวบรวมข้อมูลดังต่อไปนี้:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>ข้อมูลส่วนบุคคล:</strong> ชื่อ-นามสกุล, เบอร์โทรศัพท์, อีเมล, วันเกิด</li>
                            <li><strong>ข้อมูลการทำธุรกรรม:</strong> ประวัติการซื้อสลาก, ประวัติการชำระเงิน</li>
                            <li><strong>ข้อมูลทางเทคนิค:</strong> IP Address, ประเภทเบราว์เซอร์, ระบบปฏิบัติการ</li>
                            <li><strong>Cookies:</strong> เพื่อปรับปรุงประสบการณ์การใช้งาน</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">
                            2. วัตถุประสงค์ในการใช้ข้อมูล
                        </h2>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>ดำเนินการตามคำสั่งซื้อของท่าน</li>
                            <li>ยืนยันตัวตนและป้องกันการทุจริต</li>
                            <li>ติดต่อสื่อสารเกี่ยวกับบริการ</li>
                            <li>ปรับปรุงและพัฒนาบริการ</li>
                            <li>ปฏิบัติตามกฎหมายและข้อบังคับ</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">
                            3. การเปิดเผยข้อมูล
                        </h2>
                        <p>
                            เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้กับบุคคลที่สาม เว้นแต่:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                            <li>ท่านให้ความยินยอม</li>
                            <li>เป็นการปฏิบัติตามกฎหมาย</li>
                            <li>เพื่อป้องกันอันตรายต่อชีวิต ร่างกาย หรือทรัพย์สิน</li>
                            <li>กับผู้ให้บริการที่เกี่ยวข้อง (เช่น ธนาคาร, ผู้ให้บริการชำระเงิน)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">
                            4. การรักษาความปลอดภัยของข้อมูล
                        </h2>
                        <p>
                            เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสม เพื่อป้องกันการสูญหาย
                            การเข้าถึง การใช้ การเปลี่ยนแปลง หรือการเปิดเผยข้อมูลโดยไม่ได้รับอนุญาต
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                            <li>เข้ารหัสข้อมูลด้วย SSL/TLS</li>
                            <li>จำกัดการเข้าถึงข้อมูลเฉพาะผู้มีอำนาจ</li>
                            <li>ตรวจสอบและอัปเดตระบบรักษาความปลอดภัยอย่างสม่ำเสมอ</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">
                            5. สิทธิของเจ้าของข้อมูล
                        </h2>
                        <p>ท่านมีสิทธิ์:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                            <li>เข้าถึงและขอสำเนาข้อมูลส่วนบุคคล</li>
                            <li>แก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์</li>
                            <li>ลบหรือทำลายข้อมูล</li>
                            <li>ระงับการใช้ข้อมูล</li>
                            <li>คัดค้านการประมวลผลข้อมูล</li>
                            <li>โอนย้ายข้อมูล</li>
                            <li>ถอนความยินยอม (กรณีที่ให้ความยินยอมไว้)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">
                            6. Cookies
                        </h2>
                        <p>
                            เว็บไซต์ของเราใช้ Cookies เพื่อ:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                            <li>จดจำการตั้งค่าของท่าน</li>
                            <li>วิเคราะห์การใช้งานเว็บไซต์</li>
                            <li>ปรับปรุงประสบการณ์การใช้งาน</li>
                        </ul>
                        <p className="mt-2">
                            ท่านสามารถปิดการใช้งาน Cookies ได้ผ่านการตั้งค่าเบราว์เซอร์
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">
                            7. ระยะเวลาเก็บรักษาข้อมูล
                        </h2>
                        <p>
                            เราจะเก็บรักษาข้อมูลของท่านตามระยะเวลาที่จำเป็น หรือตามที่กฎหมายกำหนด
                            หลังจากนั้นจะทำการลบหรือทำลายข้อมูล
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">
                            8. การเปลี่ยนแปลงนโยบาย
                        </h2>
                        <p>
                            เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว
                            และจะแจ้งให้ท่านทราบผ่านทางเว็บไซต์
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">
                            9. การติดต่อเรา
                        </h2>
                        <p>
                            หากท่านมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว หรือต้องการใช้สิทธิของท่าน
                            กรุณาติดต่อ:
                        </p>
                        <div className="mt-4 p-4 bg-white/5 rounded-lg">
                            <p><strong>อีเมล:</strong> privacy@lottery-digital.com</p>
                            <p><strong>โทรศัพท์:</strong> 02-xxx-xxxx</p>
                            <p><strong>ที่อยู่:</strong> [ที่อยู่บริษัท]</p>
                        </div>
                    </section>

                    <div className="mt-8 p-4 bg-primary-500/10 border-l-4 border-primary-500 rounded">
                        <p className="text-sm">
                            <strong>วันที่มีผลบังคับใช้:</strong> 12 มกราคม 2567<br />
                            <strong>ปรับปรุงล่าสุด:</strong> 12 มกราคม 2567<br />
                            <strong>เวอร์ชัน:</strong> 1.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
