import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import NavBar from '@/components/NavBar';
import styles from './index.module.scss';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqList: FAQItem[] = [
  {
    id: 1,
    question: '如何创建行程？',
    answer:
      '在首页点击「创建行程」按钮，填写行程名称、日期、目的地等信息，点击确认即可创建成功。创建后可以添加同伴和记录账单。',
  },
  {
    id: 2,
    question: '如何添加同伴？',
    answer:
      '进入行程详情页，点击「同伴管理」，可以通过「添加同伴」手动输入，或使用「生成邀请码」生成小程序码分享给好友，好友扫码即可加入行程。',
  },
  {
    id: 3,
    question: 'AA 结算怎么算？',
    answer:
      '每笔账单会根据参与的同伴人数进行平均分摊。系统会自动统计每个人已付金额和应分摊金额，最终结算时计算出谁该给谁转多少钱，以最少转账次数完成清算。',
  },
  {
    id: 4,
    question: '多币种怎么用？',
    answer:
      '创建账单时可以选择币种，系统会按当前汇率统一换算后进行结算。汇率数据来自公开汇率接口，仅供参考。',
  },
  {
    id: 5,
    question: '油费怎么分摊？',
    answer:
      '油费可以选择按人数均摊，也可以选择按里程或按座位数分摊。在添加油费账单时选择对应的分摊方式即可。',
  },
  {
    id: 6,
    question: '如何删除账单？',
    answer:
      '在账单列表中向左滑动要删除的账单，点击删除按钮即可。注意：删除后无法恢复，请谨慎操作。只有账单创建者或行程队长可以删除账单。',
  },
];

const HelpPage: React.FC = () => {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const filteredFaqList = useMemo(() => {
    if (!searchText.trim()) return faqList;
    const keyword = searchText.toLowerCase();
    return faqList.filter(
      (item) =>
        item.question.toLowerCase().includes(keyword) ||
        item.answer.toLowerCase().includes(keyword)
    );
  }, [searchText]);

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSearchInput = useCallback((e: any) => {
    setSearchText(e.detail.value);
  }, []);

  const handleFeedback = useCallback(() => {
    setFeedbackText('');
    setShowFeedbackModal(true);
  }, []);

  const handleFeedbackSubmit = useCallback(() => {
    if (!feedbackText.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }
    setShowFeedbackModal(false);
    Taro.showToast({ title: '反馈已提交，感谢您的建议', icon: 'success' });
  }, [feedbackText]);

  return (
    <View className={styles.page}>
      <NavBar title="帮助与反馈" showBack />
      <ScrollView scrollY className={styles.scroll}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索问题关键词"
            placeholderClass={styles.searchPlaceholder}
            value={searchText}
            onInput={handleSearchInput}
          />
        </View>

        <Text className={styles.sectionTitle}>常见问题</Text>

        <View className={styles.faqList}>
          {filteredFaqList.length > 0 ? (
            filteredFaqList.map((item) => {
              const isExpanded = expandedIds.includes(item.id);
              return (
                <View
                  key={item.id}
                  className={`${styles.faqItem} ${
                    isExpanded ? styles.faqItemExpanded : ''
                  }`}
                  onClick={() => toggleExpand(item.id)}
                >
                  <View className={styles.faqQuestion}>
                    <Text className={styles.faqQuestionText}>
                      {item.question}
                    </Text>
                    <Text
                      className={`${styles.faqArrow} ${
                        isExpanded ? styles.faqArrowUp : ''
                      }`}
                    >
                      ›
                    </Text>
                  </View>
                  {isExpanded && (
                    <View className={styles.faqAnswer}>
                      <Text className={styles.faqAnswerText}>
                        {item.answer}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View className={styles.faqEmpty}>
              <Text className={styles.faqEmptyText}>暂无相关问题</Text>
            </View>
          )}
        </View>

        <View className={styles.feedbackSection}>
          <View className={styles.feedbackBtn} onClick={handleFeedback}>
            <Text className={styles.feedbackText}>意见反馈</Text>
          </View>
        </View>
      </ScrollView>

      {showFeedbackModal && (
        <View className={styles.modalOverlay} onClick={() => setShowFeedbackModal(false)}>
          <View className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>意见反馈</Text>
            <Textarea
              className={styles.modalTextarea}
              placeholder="请输入您的意见或建议，帮助我们做得更好"
              placeholderClass={styles.modalTextareaPlaceholder}
              value={feedbackText}
              onInput={(e) => setFeedbackText(e.detail.value)}
              maxlength={500}
              autoHeight
            />
            <Text className={styles.modalCount}>{feedbackText.length}/500</Text>
            <View className={styles.modalButtons}>
              <View
                className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                onClick={() => setShowFeedbackModal(false)}
              >
                <Text className={styles.modalBtnCancelText}>取消</Text>
              </View>
              <View
                className={`${styles.modalBtn} ${styles.modalBtnConfirm}`}
                onClick={handleFeedbackSubmit}
              >
                <Text className={styles.modalBtnConfirmText}>提交</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default HelpPage;
