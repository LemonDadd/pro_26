import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Input,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import Avatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import { formatMoney } from '@/utils/format';
import styles from './index.module.scss';

const MembersPage: React.FC = () => {
  const { trips, currentTripId, addMember } = useTripStore();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const members = currentTrip?.members || [];
  const expenses = currentTrip?.expenses || [];

  const handleAddMember = useCallback(() => {
    Taro.showActionSheet({
      itemList: ['手动添加', '扫码加入', '分享邀请'],
      success: (res) => {
        const actions = [
          () => setShowAddModal(true),
          () => {
            Taro.scanCode({
              onlyFromCamera: false,
              scanType: ['qrCode'],
              success: () => {
                Taro.showToast({ title: '扫码成功，已加入', icon: 'success' });
              },
              fail: () => {
                Taro.showToast({ title: '扫码功能暂不可用', icon: 'none' });
              },
            });
          },
          () => setShowShareModal(true),
        ];
        actions[res.tapIndex]?.();
      },
    });
  }, []);

  const handleAddConfirm = useCallback(() => {
    if (!newNickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (!currentTripId) return;
    const randomId = `user_${Date.now()}`;
    addMember(currentTripId, {
      id: randomId,
      name: newNickname.trim(),
      avatar: `https://picsum.photos/seed/${randomId}/200/200`,
    });
    setNewNickname('');
    setShowAddModal(false);
    Taro.showToast({ title: '添加成功', icon: 'success' });
  }, [newNickname, currentTripId, addMember]);

  const handleInvite = useCallback(() => {
    setShowInviteModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowInviteModal(false);
  }, []);

  const handleModalMaskClick = useCallback((e) => {
    e.stopPropagation();
    setShowInviteModal(false);
  }, []);

  const handleModalContentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const getMemberStat = useCallback(
    (userId: string) => {
      const paid = expenses
        .filter((e) => e.payerId === userId)
        .reduce((sum, e) => sum + e.amount, 0);

      const spent = expenses
        .filter((e) => e.participants.includes(userId))
        .reduce((sum, e) => {
          const share = e.amount / e.participants.length;
          return sum + share;
        }, 0);

      return { paid, spent, balance: paid - spent };
    },
    [expenses]
  );

  return (
    <View className={styles.page}>
      <NavBar title="同伴管理" showBack />
      <View className={styles.header}>
        <Text className={styles.headerTitle}>同伴管理</Text>
        <Text className={styles.headerSubtitle}>
          共 {members.length} 位同伴
        </Text>
      </View>

      <ScrollView scrollY>
        <View className={styles.memberList}>
          {members.map((member) => {
            const stat = getMemberStat(member.id);
            const isLeader = member.id === currentTrip?.leaderId;
            return (
              <View key={member.id} className={styles.memberItem}>
                <Avatar
                  src={member.avatar}
                  name={member.name}
                  size="large"
                />
                <View className={styles.memberInfo}>
                  <Text className={styles.memberName}>
                    {isLeader && (
                      <Text className={styles.leaderBadge}>队长</Text>
                    )}
                    {member.name}
                  </Text>
                  <Text className={styles.memberRole}>
                    已付 ¥{formatMoney(stat.paid)} · 分摊 ¥
                    {formatMoney(stat.spent)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color:
                      stat.balance >= 0 ? '#00b42a' : '#f53f3f',
                  }}
                >
                  {stat.balance >= 0 ? '+' : ''}
                  ¥{formatMoney(stat.balance)}
                </Text>
              </View>
            );
          })}
        </View>

        <View className={styles.addBtn} onClick={handleAddMember}>
          <Text className={styles.addBtnIcon}>+</Text>
          <Text className={styles.addBtnText}>添加同伴</Text>
        </View>

        <View className={styles.addBtn} onClick={handleInvite}>
          <Text className={styles.addBtnIcon}>📱</Text>
          <Text className={styles.addBtnText}>生成邀请码</Text>
        </View>
      </ScrollView>

      {showInviteModal && (
        <View
          className={styles.modalMask}
          onClick={() => setShowInviteModal(false)}
        >
          <View
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <View
              className={styles.modalClose}
              onClick={() => setShowInviteModal(false)}
            >
              <Text className={styles.modalCloseIcon}>✕</Text>
            </View>
            <Text className={styles.modalTitle}>邀请同伴</Text>
            <Text className={styles.modalTripName}>
              {currentTrip?.name || '行程'}
            </Text>
            <Image
              className={styles.qrcodeImg}
              src="https://picsum.photos/400/400"
              mode="aspectFit"
            />
            <Text className={styles.modalTip}>扫码加入行程</Text>
          </View>
        </View>
      )}

      {showAddModal && (
        <View
          className={styles.modalMask}
          onClick={() => setShowAddModal(false)}
        >
          <View
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Text className={styles.modalTitle}>添加同伴</Text>
            <View className={styles.addInputWrapper}>
              <Input
                className={styles.addInput}
                placeholder="请输入同伴昵称"
                placeholderClass={styles.inputPlaceholder}
                value={newNickname}
                onInput={(e) => setNewNickname(e.detail.value)}
                focus
              />
            </View>
            <View className={styles.modalActions}>
              <View
                className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                onClick={() => setShowAddModal(false)}
              >
                <Text className={styles.modalBtnCancelText}>取消</Text>
              </View>
              <View
                className={`${styles.modalBtn} ${styles.modalBtnConfirm}`}
                onClick={handleAddConfirm}
              >
                <Text className={styles.modalBtnConfirmText}>确定</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showShareModal && (
        <View
          className={styles.modalMask}
          onClick={() => setShowShareModal(false)}
        >
          <View
            className={styles.shareSheet}
            onClick={(e) => e.stopPropagation()}
          >
            <Text className={styles.shareTitle}>分享到</Text>
            <View className={styles.shareGrid}>
              <View className={styles.shareItem}>
                <View className={styles.shareIcon}>💬</View>
                <Text className={styles.shareText}>微信群</Text>
              </View>
              <View className={styles.shareItem}>
                <View className={styles.shareIcon}>👤</View>
                <Text className={styles.shareText}>微信好友</Text>
              </View>
              <View className={styles.shareItem}>
                <View className={styles.shareIcon}>📱</View>
                <Text className={styles.shareText}>朋友圈</Text>
              </View>
              <View className={styles.shareItem}>
                <View className={styles.shareIcon}>🔗</View>
                <Text className={styles.shareText}>复制链接</Text>
              </View>
            </View>
            <View
              className={styles.shareCancel}
              onClick={() => setShowShareModal(false)}
            >
              <Text className={styles.shareCancelText}>取消</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default MembersPage;
